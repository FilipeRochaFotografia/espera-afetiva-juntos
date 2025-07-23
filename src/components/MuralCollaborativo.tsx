import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Camera, Heart, Smile, Send, X, Image as ImageIcon, Edit, Loader2 } from "lucide-react";
import { Event, Post, User } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { processImageForUpload, validateImageFile } from "@/lib/imageCompression";
import { SimpleImage } from "@/components/ui/simple-image";

interface MuralCollaborativoProps {
  event: Event;
  isActive: boolean;
  showCreatePost?: boolean;
  setShowCreatePost?: (show: boolean) => void;
}

const reactionEmojis = ["❤️", "😍", "🥰", "👏", "🎉", "💕", "✨", "🔥"];

export const MuralCollaborativo = ({ event, isActive, showCreatePost: externalShowCreatePost, setShowCreatePost: externalSetShowCreatePost }: MuralCollaborativoProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [internalShowCreatePost, setInternalShowCreatePost] = useState(false);
  
  // Usar props externas se disponíveis, senão usar estado interno
  const showCreatePost = externalShowCreatePost !== undefined ? externalShowCreatePost : internalShowCreatePost;
  const setShowCreatePost = externalSetShowCreatePost || setInternalShowCreatePost;
  const [newPost, setNewPost] = useState<{ type: 'text' | 'image'; content: string; mediaUrl: string }>({ 
    type: 'text', 
    content: '', 
    mediaUrl: '' 
  });
  const [editingPost, setEditingPost] = useState<{ id: string; content: string; mediaUrl: string } | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
    if (isActive) {
      fetchPosts();
      // Configurar real-time subscription
      const channel = supabase
        .channel(`mural-${event.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'mural_posts', filter: `event_id=eq.${event.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setPosts(prev => [payload.new as Post, ...prev]);
            } else if (payload.eventType === 'DELETE') {
              setPosts(prev => prev.filter(p => p.id !== payload.old.id));
            } else if (payload.eventType === 'UPDATE') {
              // Recarregar posts quando houver atualização (ex: reações)
              fetchPosts();
            }
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'mural_reactions' },
          () => {
            // Recarregar posts quando reações mudarem
            fetchPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [event.id, isActive]);

  const fetchUser = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      setUser({
        id: userData.user.id,
        name: userData.user.user_metadata?.name || 'Usuário',
        email: userData.user.email || '',
        avatar_url: userData.user.user_metadata?.avatar_url
      });
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validar arquivo
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: "Arquivo inválido",
          description: validation.error,
          variant: "destructive",
        });
        return null;
      }

      // Processar imagem (redimensionar + comprimir)
      // Removida notificação de processamento

      const processedFile = await processImageForUpload(file);
      
      console.log('Imagem processada:', {
        original: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        processed: `${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
        reduction: `${((1 - processedFile.size / file.size) * 100).toFixed(1)}%`
      });

      // Gerar nome único para o arquivo
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${event.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('mural-images')
        .upload(fileName, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        toast({
          title: "Erro ao fazer upload",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
        return null;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('mural-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro ao fazer upload",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const fetchPosts = async () => {
    console.log('Buscando posts para evento:', event.id);
    
    const { data, error } = await supabase
      .from('mural_posts')
      .select(`
        *,
        reactions:mural_reactions(*)
      `)
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      console.log('Posts encontrados:', data);
      // Adicionar informações do usuário localmente
      const postsWithUser = data.map(post => ({
        ...post,
        user: {
          id: post.user_id,
          name: user?.name || 'Usuário',
          email: user?.email || '',
          avatar_url: user?.avatar_url
        }
      }));
      setPosts(postsWithUser as Post[]);
    } else {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!user || (!newPost.content.trim() && !newPost.mediaUrl)) return;
    
    // Verificar se o evento está ativo
    if (!isActive) {
      toast({
        title: "Evento não ativo",
        description: "O mural só está disponível para eventos ativos.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    
    let mediaUrl = newPost.mediaUrl;
    
    // Se há uma URL local (preview), fazer upload real
    if (newPost.mediaUrl && newPost.mediaUrl.startsWith('blob:') && selectedFile) {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) {
        mediaUrl = uploadedUrl;
      } else {
        setLoading(false);
        return; // Erro no upload
      }
    }

    const postData = {
      event_id: event.id,
      user_id: user.id,
      type: newPost.type,
      content: newPost.content,
      media_url: mediaUrl || undefined
    };

    console.log('Criando post:', postData);

    const { error: insertError } = await supabase
      .from('mural_posts')
      .insert([postData]);

    if (insertError) {
      console.error('Erro na inserção:', insertError);
      setLoading(false);
      toast({
        title: "Erro ao criar post",
        description: insertError.message,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(false);
    console.log('Post criado com sucesso!');
    setNewPost({ type: 'text', content: '', mediaUrl: '' });
    setSelectedFile(null);
    setShowCreatePost(false);
    // Recarregar posts para mostrar o novo post
    await fetchPosts();
    toast({
      title: "Post criado!",
      description: "Sua mensagem foi adicionada ao mural.",
      duration: 2000,
    });
  };

  const handleReaction = async (postId: string, emoji: string) => {
    if (!user) return;

    // Verificar se o usuário já reagiu a este post
    const existingReaction = posts.find(post => post.id === postId)?.reactions?.find(
      reaction => reaction.user_id === user.id
    );

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Se clicou no mesmo emoji, remover a reação
        const { error } = await supabase
          .from('mural_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (!error) {
          setPosts(prev => prev.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                reactions: post.reactions?.filter(r => r.user_id !== user.id) || []
              };
            }
            return post;
          }));
        }
      } else {
        // Se clicou em um emoji diferente, atualizar a reação
        const { error } = await supabase
          .from('mural_reactions')
          .update({ emoji })
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (!error) {
          setPosts(prev => prev.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                reactions: post.reactions?.map(r => 
                  r.user_id === user.id ? { ...r, emoji } : r
                ) || []
              };
            }
            return post;
          }));
        }
      }
    } else {
      // Se não reagiu, adicionar a reação
      const { error } = await supabase
        .from('mural_reactions')
        .insert([{
          post_id: postId,
          user_id: user.id,
          emoji
        }]);

      if (!error) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              reactions: [...(post.reactions || []), {
                id: Date.now().toString(),
                post_id: postId,
                user_id: user.id,
                emoji,
                created_at: new Date(),
                user
              }]
            };
          }
          return post;
        }));
      }
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora';
  };

  const handleEditPost = async () => {
    if (!editingPost || !editingPost.content.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('mural_posts')
      .update({ 
        content: editingPost.content,
        media_url: editingPost.mediaUrl || null
      })
      .eq('id', editingPost.id)
      .eq('user_id', user?.id);

    setLoading(false);
    if (!error) {
      setEditingPost(null);
      await fetchPosts();
      toast({
        title: "Post editado!",
        description: "Sua mensagem foi atualizada.",
        duration: 2000,
      });
    } else {
      toast({
        title: "Erro ao editar post",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('mural_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);

    if (!error) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: "Post excluído!",
        description: "Sua mensagem foi removida.",
        duration: 2000,
      });
    } else {
      toast({
        title: "Erro ao excluir post",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUnlockClick = () => {
    navigate(`/desbloquear/${event.id}`);
  };

  if (!isActive) {
    return (
      <Card 
        className="shadow-xl border-purple-100/30 bg-gradient-to-br from-white/95 to-purple-25/80 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
        onClick={handleUnlockClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <div>
              <div className="font-semibold text-purple-800">Mural Colaborativo</div>
              <div className="text-xs text-purple-500 font-medium">Ative para desbloquear</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 pb-6">
          {/* Preview do mural */}
          <div className="relative bg-gradient-to-br from-purple-50 to-lavender-100 border border-purple-200 rounded-xl p-6 shadow-lg">
            {/* Ícones flutuantes animados */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md animate-pulse">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="absolute top-8 left-6 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md animate-pulse" style={{ animationDelay: '1s' }}>
              <Heart className="w-4 h-4 text-purple-600" />
            </div>
            
            {/* Conteúdo central */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-800 mb-2">Momentos especiais juntos</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Transforme a espera em uma experiência compartilhada com mensagens, fotos e reações em tempo real
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Aguarda ativação</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header do Mural */}
      <Card className="shadow-lg border-purple-100/30 bg-gradient-to-br from-white/95 to-purple-25/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            Mural Colaborativo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <Button
            onClick={() => setShowCreatePost(true)}
            className="w-full bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold hover:shadow-glow transition-all"
          >
            Criar um post
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card className="shadow-lg border-purple-100/30 bg-gradient-to-br from-white/95 to-purple-25/80 backdrop-blur-sm">
            <CardContent className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Seja o primeiro a compartilhar algo!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mostrar mensagens baseado no estado */}
            {(showAllPosts ? posts : posts.slice(0, 3)).map((post) => (
            <Card key={post.id} className="shadow-lg border-purple-100/30 bg-gradient-to-br from-white/95 to-purple-25/80 backdrop-blur-sm">
              <CardContent className="p-4">
                {/* Header do Post */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {post.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{post.user?.name || 'Usuário'}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão de edição (apenas para posts do usuário) */}
                  {post.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPost({
                        id: post.id,
                        content: post.content || '',
                        mediaUrl: post.media_url || ''
                      })}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Conteúdo do Post */}
                <div className="mb-3">
                  {post.type === 'text' && (
                    <p className="text-sm leading-relaxed">{post.content}</p>
                  )}
                  {post.type === 'image' && post.media_url && (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      <SimpleImage
                        src={post.media_url}
                        alt="Post image"
                        className="rounded-lg w-full"
                      />
                    </div>
                  )}

                </div>

                {/* Reações */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {reactionEmojis.map((emoji) => {
                      const hasReacted = post.reactions?.some(r => r.user_id === user?.id && r.emoji === emoji);
                      const reactionCount = post.reactions?.filter(r => r.emoji === emoji).length || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(post.id, emoji)}
                          className={`p-1.5 rounded-full transition-all duration-200 ${
                            hasReacted 
                              ? 'bg-purple-100 scale-110' 
                              : 'hover:bg-purple-50 hover:scale-105'
                          }`}
                          style={{
                            animation: hasReacted ? 'reactionPop 0.4s ease-out' : 'none'
                          }}
                          title={`Reagir com ${emoji}`}
                        >
                          <span className="text-base">{emoji}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Botão para alternar visualização */}
          {posts.length > 3 && (
            <Card className="shadow-lg border-purple-100/30 bg-gradient-to-br from-white/95 to-purple-25/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAllPosts(!showAllPosts)}
                  className="w-full bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-medium py-3 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  {showAllPosts ? 'Ver apenas as 3 últimas' : `Ver todas as ${posts.length} mensagens`}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>

      {/* Modal de Criação de Post */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="max-w-sm p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Criar um post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Área de mensagem */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Mensagem (opcional)</label>
              <Textarea
                placeholder="Compartilhe algo especial... (opcional)"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={5}
                className="resize-none border-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none rounded-lg p-4"
              />
            </div>

            {/* Área de anexo de foto */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Anexar foto (opcional)</label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setNewPost(prev => ({ 
                          ...prev, 
                          type: 'image',
                          mediaUrl: URL.createObjectURL(file)
                        }));
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2"
                >
                  <Camera className="w-4 h-4" />
                  Tirar foto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setNewPost(prev => ({ 
                          ...prev, 
                          type: 'image',
                          mediaUrl: URL.createObjectURL(file)
                        }));
                      }
                    };
                    input.click();
                  }}
                  className="flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Anexar
                </Button>
              </div>
              
              {/* Preview da imagem */}
              {newPost.mediaUrl && newPost.type === 'image' && (
                <div className="relative">
                  <SimpleImage
                    src={newPost.mediaUrl}
                    alt="Preview"
                    className="rounded-xl border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setNewPost(prev => ({ ...prev, mediaUrl: '', type: 'text' }));
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="pt-4">
              <Button
                onClick={handleCreatePost}
                disabled={loading || (!newPost.content.trim() && !newPost.mediaUrl)}
                className="w-full bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 hover:shadow-md transition-all duration-300 text-white font-medium py-3 rounded-lg"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Post */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-sm p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Editar post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Área de mensagem */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Mensagem</label>
              <Textarea
                placeholder="Edite sua mensagem..."
                value={editingPost?.content || ''}
                onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                rows={5}
                className="resize-none border-gray-300 focus:border-gray-400 focus:ring-0 focus:outline-none rounded-lg p-4"
              />
            </div>

            {/* Preview da imagem atual */}
            {editingPost?.mediaUrl && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Imagem atual</label>
                <div className="relative">
                  <SimpleImage
                    src={editingPost.mediaUrl}
                    alt="Current"
                    className="rounded-xl border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingPost(prev => prev ? { ...prev, mediaUrl: '' } : null)}
                    className="absolute top-2 right-2 h-8 w-8 bg-white/90 hover:bg-white rounded-full shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleEditPost}
                disabled={loading || !editingPost?.content.trim()}
                className="flex-1 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 hover:shadow-md transition-all duration-300 text-white font-medium py-3 rounded-xl"
              >
                {loading ? (
                  <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingPost(null)}
                className="border-purple-100 text-purple-600 hover:bg-purple-25 py-3 rounded-xl"
              >
                Cancelar
              </Button>
            </div>
            
            {/* Botão de excluir */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingPostId(editingPost?.id || null)}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Excluir post
              </Button>
            </div>
          </div>
                </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!deletingPostId} onOpenChange={() => setDeletingPostId(null)}>
        <DialogContent className="max-w-sm p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Excluir post
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-gray-600">
              <p>Tem certeza que deseja excluir este post?</p>
              <p>Esta ação não pode ser desfeita.</p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  if (deletingPostId) {
                    handleDeletePost(deletingPostId);
                    setDeletingPostId(null);
                    setEditingPost(null);
                  }
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl"
              >
                Excluir
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeletingPostId(null)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 