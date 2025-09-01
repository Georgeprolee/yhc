import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/authContext';
import { stories, storyApi, Story } from '@/mocks/stories';
import { categories, categoryApi, Category } from '@/mocks/categories';
import { useTheme } from '@/contexts/ThemeContext';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { StoryFormModal } from '@/components/StoryFormModal';
import { CategoryFormModal } from '@/components/CategoryFormModal';
import { FileUploader } from '@/components/FileUploader';
import { MediaList } from '@/components/MediaList';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { toast } from 'sonner';

export default function AdminPanel() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('stories');
  const [activeMediaTab, setActiveMediaTab] = useState('image');
  
  // Data states
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'story' | 'category'} | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    // Load initial data
    loadAllData();
  }, [isAuthenticated, navigate]);

  // Load all admin data
  const loadAllData = () => {
    setIsLoading(true);
    
    try {
      // Load stories
      const storiesData = storyApi.getAll();
      setAllStories(storiesData);
      
      // Load categories
      const categoriesData = categoryApi.getAll();
      setAllCategories(categoriesData);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('加载数据失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalStories: allStories.length,
    totalCategories: allCategories.length,
    totalViews: allStories.reduce((sum, story) => sum + story.views, 0),
    popularStory: allStories.length > 0 
      ? [...allStories].sort((a, b) => b.views - a.views)[0] 
      : null
  };

  // Story management functions
  const handleEditStory = (story: Story) => {
    setCurrentStory(story);
    setIsStoryModalOpen(true);
  };

  const handleAddStory = () => {
    setCurrentStory(null);
    setIsStoryModalOpen(true);
  };

  const confirmDeleteStory = (id: string) => {
    setItemToDelete({id, type: 'story'});
    setIsDeleteModalOpen(true);
  };

  const saveStory = (storyData: Omit<Story, 'id' | 'views' | 'createdAt'>) => {
    try {
       if (currentStory) {
         // Update existing story
         const result = storyApi.update(currentStory.id, storyData);
         if (result.success && result.story) {
           setAllStories(allStories.map(story => 
             story.id === currentStory.id ? result.story : story
           ));
           toast.success('故事更新成功');
         } else {
           toast.error(`更新故事失败: ${result.error || '未知错误'}`);
         }
       } else {
         // Add new story
         const result = storyApi.add(storyData);
         if (result.success && result.story) {
           setAllStories([...allStories, result.story]);
           toast.success('故事添加成功');
         } else {
           toast.error(`添加故事失败: ${result.error || '未知错误'}`);
         }
       }
       setIsStoryModalOpen(false);
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('保存故事失败');
    }
  };

  const deleteStory = () => {
    if (!itemToDelete || itemToDelete.type !== 'story') return;
    
    try {
      const success = storyApi.delete(itemToDelete.id);
      if (success) {
        setAllStories(allStories.filter(story => story.id !== itemToDelete.id));
        toast.success('故事删除成功');
      } else {
        toast.error('删除故事失败');
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('删除故事失败');
    }
  };

  // Category management functions
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleAddCategory = () => {
    setCurrentCategory(null);
    setIsCategoryModalOpen(true);
  };

  const confirmDeleteCategory = (id: string) => {
    setItemToDelete({id, type: 'category'});
    setIsDeleteModalOpen(true);
  };

  const saveCategory = (categoryData: Omit<Category, 'id'>) => {
    try {
      if (currentCategory) {
        // Update existing category
        const updatedCategory = categoryApi.update(currentCategory.id, categoryData);
        if (updatedCategory) {
          setAllCategories(allCategories.map(category => 
            category.id === currentCategory.id ? updatedCategory : category
          ));
          toast.success('分类更新成功');
        } else {
          toast.error('更新分类失败');
        }
      } else {
        // Add new category
        const newCategory = categoryApi.add(categoryData);
        setAllCategories([...allCategories, newCategory]);
        toast.success('分类添加成功');
      }
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('保存分类失败');
    }
  };

  const deleteCategory = () => {
    if (!itemToDelete || itemToDelete.type !== 'category') return;
    
    // Check if category has stories
    const hasStories = allStories.some(story => story.categoryId === itemToDelete.id);
    if (hasStories) {
      toast.error('无法删除包含故事的分类，请先移动或删除该分类下的故事');
      setIsDeleteModalOpen(false);
      return;
    }
    
    try {
      const success = categoryApi.delete(itemToDelete.id);
      if (success) {
        setAllCategories(allCategories.filter(category => category.id !== itemToDelete.id));
        toast.success('分类删除成功');
      } else {
        toast.error('删除分类失败');
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('删除分类失败');
    }
  };

  // Password change function
  const handlePasswordChange = (newPassword: string) => {
    // In a real application, this would send the new password to the backend
    // For mock purposes, we'll store it in localStorage
    localStorage.setItem('admin_password', newPassword);
    toast.success('密码修改成功');
  };

  // Media management functions
  const handleFileUpload = (file: File, fileType: string) => {
    // In a real application, this would upload to a server
    // For mock purposes, we'll store in localStorage
    
    try {
      // Generate unique ID
      const fileId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create media object
      const mediaFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        url: URL.createObjectURL(file),
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      
      // Get existing media files
      const storedFiles = JSON.parse(localStorage.getItem(`media_${fileType}`) || '[]');
      
      // Add new file
      storedFiles.push(mediaFile);
      
      // Save back to localStorage
      localStorage.setItem(`media_${fileType}`, JSON.stringify(storedFiles));
      
      toast.success(`文件 "${file.name}" 上传成功`);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('文件上传失败，请重试');
    }
  };

  const handleMediaDelete = (id: string) => {
    try {
      // Get existing media files
      const storedFiles = JSON.parse(localStorage.getItem(`media_${activeMediaTab}`) || '[]');
      
      // Find file to remove
      const fileToRemove = storedFiles.find((file: any) => file.id === id);
      if (!fileToRemove) {
        toast.error('文件不存在');
        return;
      }
      
      // Remove file from array
      const updatedFiles = storedFiles.filter((file: any) => file.id !== id);
      
      // Save back to localStorage
      localStorage.setItem(`media_${activeMediaTab}`, JSON.stringify(updatedFiles));
      
      toast.success(`文件 "${fileToRemove.name}" 删除成功`);
      
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('文件删除失败，请重试');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载管理面板中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              <i className="fa-solid fa-cogs mr-2"></i>管理员面板
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <i className="fa-solid fa-home mr-1"></i> 返回首页
            </Link>
            
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <i className="fa-solid fa-key mr-1"></i> 修改密码
            </button>
            
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <i className="fa-solid fa-sign-out-alt mr-1"></i> 退出登录
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">故事总数</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalStories}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <i className="fa-solid fa-book text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">分类总数</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalCategories}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                <i className="fa-solid fa-tags text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">总浏览量</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <i className="fa-solid fa-eye text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">最受欢迎</p>
                <h3 className="text-lg font-bold mt-1 line-clamp-1">{stats.popularStory?.title || '暂无数据'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.popularStory ? `${stats.popularStory.views} 次浏览` : ''}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <i className="fa-solid fa-star text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('stories')}
                className={`px-6 py-4 text-sm font-medium focus:outline-none transition-all ${
                  activeTab === 'stories'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-book mr-2"></i>故事管理
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-4 text-sm font-medium focus:outline-none transition-all ${
                  activeTab === 'categories'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-tags mr-2"></i>分类管理
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`px-6 py-4 text-sm font-medium focus:outline-none transition-all ${
                  activeTab === 'media'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-file-video mr-2"></i>媒体管理
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 text-sm font-medium focus:outline-none transition-all ${
                  activeTab === 'stats'
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className="fa-solid fa-chart-bar mr-2"></i>数据统计
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Stories Management */}
            {activeTab === 'stories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">故事管理</h2>
                  <button 
                    onClick={handleAddStory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <i className="fa-solid fa-plus mr-1"></i> 添加故事
                  </button>
                </div>
                
                {allStories.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <i className="fa-solid fa-book-open text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">暂无故事数据</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">点击"添加故事"按钮创建您的第一个故事</p>
                    <button 
                      onClick={handleAddStory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fa-solid fa-plus mr-1"></i> 添加故事
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">标题</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">分类</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">时长</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">适合年龄</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">浏览量</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {allStories.map((story) => {
                          const category = allCategories.find(c => c.id === story.categoryId);
                          return (
                            <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900 dark:text-white">{story.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                                  {category?.name || '未分类'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {story.duration} 分钟
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {story.ageRange}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {story.views}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => handleEditStory(story)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 transition-colors"
                                >
                                  <i className="fa-solid fa-edit"></i> 编辑
                                </button>
                                <button 
                                  onClick={() => confirmDeleteStory(story.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                >
                                  <i className="fa-solid fa-trash"></i> 删除
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Categories Management */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">分类管理</h2>
                  <button 
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <i className="fa-solid fa-plus mr-1"></i> 添加分类
                  </button>
                </div>
                
                {allCategories.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <i className="fa-solid fa-tags text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">暂无分类数据</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">点击"添加分类"按钮创建您的第一个分类</p>
                    <button 
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fa-solid fa-plus mr-1"></i> 添加分类
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">图标</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">名称</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">描述</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">故事数量</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {allCategories.map((category) => {
                          // Count stories in this category
                          const storyCount = allStories.filter(story => story.categoryId === category.id).length;
                          
                          return (
                            <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                                  <i className={`fa-solid ${category.icon} text-white`}></i>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">{category.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {storyCount} 个故事
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => {
                                    setCurrentCategory(category);
                                    setIsCategoryModalOpen(true);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 transition-colors"
                                >
                                  <i className="fa-solid fa-edit"></i> 编辑
                                </button>
                                <button 
                                  onClick={() => {
                                    setItemToDelete({id: category.id, type: 'category'});
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                >
                                  <i className="fa-solid fa-trash"></i> 删除
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Media Management */}
            {activeTab === 'media' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">媒体管理</h2>
                  
                  <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <button
                      onClick={() => setActiveMediaTab('image')}
                      className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeMediaTab === 'image'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-image mr-1"></i> 图片
                    </button>
                    <button
                      onClick={() => setActiveMediaTab('video')}
                      className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeMediaTab === 'video'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-video mr-1"></i> 视频
                    </button>
                    <button
                      onClick={() => setActiveMediaTab('audio')}
                      className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeMediaTab === 'audio'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <i className="fa-solid fa-music mr-1"></i> 音频
                    </button>
                  </div>
                </div>
                
                {/* File Uploader */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">上传{
                    activeMediaTab === 'image' ? '图片' : 
                    activeMediaTab === 'video' ? '视频' : '音频'
                  }</h3>
                  
                  <FileUploader 
                    onFileUpload={handleFileUpload}
                    allowedTypes={[activeMediaTab]}
                    label={`点击或拖拽${
                      activeMediaTab === 'image' ? '图片' : 
                      activeMediaTab === 'video' ? '视频' : '音频'
                    }文件到此处上传`}
                  />
                </div>
                
                {/* Media Files List */}
                <div>
                  <h3 className="text-lg font-medium mb-4">{
                    activeMediaTab === 'image' ? '图片' : 
                    activeMediaTab === 'video' ? '视频' : '音频'
                  }文件列表</h3>
                  
                  <MediaList 
                    mediaType={activeMediaTab as 'image' | 'video' | 'audio'}
                    onDelete={handleMediaDelete}
                  />
                </div>
              </div>
            )}
            
            {/* Statistics */}
            {activeTab === 'stats' && (
              <div className="p-8 text-center">
                <i className="fa-solid fa-chart-bar text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400">数据统计功能即将上线</h3>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={`确认删除${itemToDelete?.type === 'story' ? '故事' : '分类'}`}
        message={`您确定要删除这个${itemToDelete?.type === 'story' ? '故事' : '分类'}吗？此操作无法撤销。`}
        onConfirm={itemToDelete?.type === 'story' ? deleteStory : deleteCategory}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        confirmText="删除"
        cancelText="取消"
      />
      
      {/* Story Edit/Create Modal */}
      <StoryFormModal
        isOpen={isStoryModalOpen}
        story={currentStory || undefined}
        onSave={saveStory}
        onCancel={() => {
          setIsStoryModalOpen(false);
          setCurrentStory(null);
        }}
      />
      
      {/* Category Edit/Create Modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        category={currentCategory || undefined}
        onSave={saveCategory}
        onCancel={() => {
          setIsCategoryModalOpen(false);
          setCurrentCategory(null);
        }}
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onPasswordChange={handlePasswordChange}
      />
    </div>
  );
}