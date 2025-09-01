import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { categories } from "@/mocks/categories";
import { getStoriesByCategory, getStoryById, Story } from "@/mocks/stories";

import { StoryCard } from "@/components/StoryCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Home() {
    const {
        theme
    } = useTheme();

    const {
        isAuthenticated
    } = useContext(AuthContext);

    const navigate = useNavigate();
    const [adminClicks, setAdminClicks] = useState(0);
    const [showStars, setShowStars] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const [favoriteStories, setFavoriteStories] = useState<Story[]>([]);

    const handleAdminAccess = () => {
        setAdminClicks(prev => {
            const newCount = prev + 1;

            if (newCount >= 5) {
                navigate("/admin/login");
                return 0;
            }

            return newCount;
        });
    };

    useEffect(() => {
        const loadFavorites = () => {
            const savedFavorites = localStorage.getItem("favorites");

            if (savedFavorites) {
                const favoriteIds = JSON.parse(savedFavorites);
                const favorites = favoriteIds.map((id: string) => getStoryById(id)).filter(Boolean) as Story[];
                setFavoriteStories(favorites);
            }
        };

        loadFavorites();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "favorites") {
                loadFavorites();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    useEffect(() => {
        setShowStars(theme === "night");
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current) {
                if (window.scrollY > 20) {
                    headerRef.current.classList.add("bg-white/90", "dark:bg-gray-900/90", "shadow-md");
                    headerRef.current.classList.remove("bg-transparent");
                } else {
                    headerRef.current.classList.remove("bg-white/90", "dark:bg-gray-900/90", "shadow-md");
                    headerRef.current.classList.add("bg-transparent");
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            {showStars && <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(50)].map((_, i) => <div
                    key={i}
                    className="absolute animate-twinkle"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        opacity: Math.random() * 0.8 + 0.2,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 3 + 2}s`
                    }}></div>)}
            </div>}
            <header
                ref={headerRef}
                className="sticky top-0 z-50 w-full transition-all duration-300 bg-transparent backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div
                            className="text-3xl font-bold text-yellow-500 mr-2 cursor-pointer"
                            onClick={handleAdminAccess}>
                            <i className="fa-solid fa-moon"></i>
                        </div>
                        <h1
                            className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent">萤火虫</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <></>
            <section className="mb-16 container mx-auto px-4">
                {categories.map(category => (
                    <div key={category.id} className="mb-12">
                        <div className="flex items-center mb-6">
                            <div
                                className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center mr-3 shadow-md`}>
                                <i className={`fa-solid ${category.icon} text-white text-xl`}></i>
                            </div>
                            <Link to={`/category/${category.id}`} className="group">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {category.name}
                                </h2>
                            </Link>
                            <p
                                className="ml-4 text-gray-600 dark:text-gray-300 text-sm hidden md:inline-block">{category.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getStoriesByCategory(category.id).slice(0, 3).map(story => (
                                <StoryCard key={story.id} story={story} />
                            ))}
                        </div>
                        
                        {getStoriesByCategory(category.id).length > 3 && (
                            <div className="mt-6 text-center">
                                <Link 
                                    to={`/category/${category.id}`}
                                    className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    查看更多 <i className="fa-solid fa-arrow-right ml-2"></i>
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </section>
            {}
             <section className="mb-16 container mx-auto px-4">
                 {(() => {
                     const favoriteCategory = {
                         id: "favorites",
                         name: "我的收藏",
                         description: "您收藏的故事",
                         icon: "fa-heart",
                         color: "bg-red-300"
                     };
     
                     if (favoriteStories.length > 0) {
                         return (
                             <div className="mb-12">
                                 <div className="flex items-center mb-6">
                                     <div
                                         className={`w-10 h-10 rounded-full ${favoriteCategory.color} flex items-center justify-center mr-3 shadow-md`}>
                                         <i className={`fa-solid ${favoriteCategory.icon} text-white text-xl`}></i>
                                     </div>
                                     <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                         {favoriteCategory.name}
                                     </h2>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                     {favoriteStories.map(story => (
                                         <StoryCard key={story.id} story={story} />
                                     ))}
                                 </div>
                             </div>
                         );
                     } else {
                         return (
                             <div
                                 className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                                 <div
                                     className={`w-16 h-16 rounded-full ${favoriteCategory.color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                                     <i className={`fa-solid ${favoriteCategory.icon} text-white text-2xl`}></i>
                                 </div>
                                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{favoriteCategory.name}</h2>
                                 <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">您还没有收藏任何故事，浏览故事时点击收藏按钮将显示在这里
                                                                                                                              </p>
                                 <button
                                     onClick={() => toast("功能开发中，敬请期待")}
                                     className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                     <i className="fa-solid fa-search mr-1"></i>查找故事
                                                                                                                              </button>
                             </div>
                         );
                     }
                 })()}
             </section>
            <footer
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-6 border-t border-gray-200 dark:border-gray-700">
                <div
                    className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 text-sm">
                    <p><Link to="/admin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">萤火虫 - 让宝贝的夜晚充满美好</Link></p>
                    <></>
                    <p className="mt-1">联系电话：15287478255 | 邮箱：44207898@qq.com</p>
                </div>
            </footer>
        </div>
    );
}