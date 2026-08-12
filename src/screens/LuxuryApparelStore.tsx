import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { FabriQBrandedImage, LabelType } from '../components/FabriQBrandedImage';
import { useNotifications } from '../context/NotificationContext';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export interface ApparelProduct {
  id: string;
  name: string;
  category: 'Shirts' | 'T-Shirts' | 'Jeans' | 'Kurthas' | 'Shoes';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  fabric: string;
  fit: string;
  badge?: string;
  imageUrl: string;
  description: string;
  sizes: string[];
}

export const FABRIQ_LUXURY_PRODUCTS: ApparelProduct[] = [
  {
    id: 'fabriq-shirt-01',
    name: 'Royal Italian Egyptian Cotton Shirt',
    category: 'Shirts',
    price: 3499,
    originalPrice: 4999,
    rating: 4.9,
    reviewsCount: 128,
    fabric: '100% Giza Egyptian Cotton',
    fit: 'Tailored Slim Fit',
    badge: 'BESTSELLER',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra-crisp 120s two-ply Giza cotton shirt with mother-of-pearl buttons and crease-resistant finish.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'fabriq-shirt-02',
    name: 'French Cuff Executive Silk Blend Shirt',
    category: 'Shirts',
    price: 4299,
    originalPrice: 5999,
    rating: 4.8,
    reviewsCount: 94,
    fabric: 'Silk-Cotton Micro Jacquard',
    fit: 'Classic Tailored Fit',
    badge: 'LUXURY',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    description: 'Elegantly lustrous micro jacquardweave tailored for galas, boardroom meetings, and black-tie events.',
    sizes: ['38', '40', '42', '44', '46'],
  },
  {
    id: 'fabriq-tshirt-01',
    name: 'Supima Gold Crewneck Luxe T-Shirt',
    category: 'T-Shirts',
    price: 1499,
    originalPrice: 2299,
    rating: 4.9,
    reviewsCount: 210,
    fabric: '100% Long-Staple Supima Cotton',
    fit: 'Modern Athletic Fit',
    badge: 'MUST HAVE',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    description: 'Engineered with anti-pilling compact spun Supima cotton for unmatched softness and long-lasting shape.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'fabriq-tshirt-02',
    name: 'Merino Wool Blend Polo T-Shirt',
    category: 'T-Shirts',
    price: 2299,
    originalPrice: 3199,
    rating: 4.7,
    reviewsCount: 86,
    fabric: 'Fine Australian Merino & Cotton',
    fit: 'Slim Polo Fit',
    badge: 'NEW',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    description: 'Thermoregulating breathable Merino knit polo featuring ribbed collar and gold FabriQ crest emblem.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'fabriq-jeans-01',
    name: 'Japanese Selvedge Raw Denim Jeans',
    category: 'Jeans',
    price: 4999,
    originalPrice: 6999,
    rating: 5.0,
    reviewsCount: 142,
    fabric: '14oz Kurabo Japanese Selvedge Denim',
    fit: 'Straight Tapered',
    badge: 'HERITAGE',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    description: 'Woven on vintage shuttle looms with genuine indigo dye, brass hardware, and reinforced leather patch.',
    sizes: ['30', '32', '34', '36', '38'],
  },
  {
    id: 'fabriq-jeans-02',
    name: 'Atelier Stretch Charcoal Denim Pants',
    category: 'Jeans',
    price: 3899,
    originalPrice: 5299,
    rating: 4.8,
    reviewsCount: 75,
    fabric: '98% Cotton Denim, 2% Elastane',
    fit: 'Slim Tapered',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c36856842?auto=format&fit=crop&w=800&q=80',
    description: 'Sleek matte charcoal finish with 4-way stretch flexibility for effortless all-day comfort.',
    sizes: ['30', '32', '34', '36'],
  },
  {
    id: 'fabriq-kurtha-01',
    name: 'Handwoven Chanderi Silk Royal Kurta Set',
    category: 'Kurthas',
    price: 5999,
    originalPrice: 8499,
    rating: 4.9,
    reviewsCount: 168,
    fabric: 'Pure Chanderi Silk & Zari Threads',
    fit: 'Royal Festive Fit',
    badge: 'ROYAL COLLECTION',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'Exquisite hand-embroidered neckline with antique metallic gold thread work and silk churidar pyjama.',
    sizes: ['38', '40', '42', '44'],
  },
  {
    id: 'fabriq-kurtha-02',
    name: 'Linen Cotton Asymmetric Designer Kurta',
    category: 'Kurthas',
    price: 3299,
    originalPrice: 4499,
    rating: 4.7,
    reviewsCount: 92,
    fabric: '100% Pure Organic Linen',
    fit: 'Contemporary Flowing Fit',
    badge: 'TRENDING',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight, breathable pure linen kurta with diagonal button placket and hidden side pockets.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'fabriq-shoes-01',
    name: 'Handcrafted Italian Calfskin Oxford Shoes',
    category: 'Shoes',
    price: 7999,
    originalPrice: 10999,
    rating: 5.0,
    reviewsCount: 114,
    fabric: 'Full-Grain Italian Calf Leather',
    fit: 'Goodyear Welted Sole',
    badge: 'HANDMADE IN ITALY',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    description: 'Hand-burnished cognac calfskin with Goodyear welt construction and cushioned memory foam leather insoles.',
    sizes: ['7', '8', '9', '10', '11'],
  },
  {
    id: 'fabriq-shoes-02',
    name: 'Monk Strap Suede Loafers with Gold Buckle',
    category: 'Shoes',
    price: 6499,
    originalPrice: 8999,
    rating: 4.8,
    reviewsCount: 88,
    fabric: 'Velvety Tuscan Suede',
    fit: 'Slip-on Comfort Fit',
    badge: 'EXCLUSIVELY FABRIQ',
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    description: 'Rich dark espresso suede accented by a custom FabriQ gold-plated double monk buckle.',
    sizes: ['7', '8', '9', '10', '11'],
  },
];

export const LuxuryApparelStore: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fabriq_favorite_store_items');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const { sendNotification } = useNotifications();

  // Simulate loading and fetch Firestore favorites
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    const fetchUserFavorites = async () => {
      const userId = auth.currentUser?.uid || 'guest';
      if (userId !== 'guest') {
        try {
          const favRef = doc(db, 'user_favorites', `${userId}_store`);
          const snap = await getDoc(favRef);
          if (snap.exists() && snap.data().favorites) {
            setFavorites(snap.data().favorites);
            localStorage.setItem('fabriq_favorite_store_items', JSON.stringify(snap.data().favorites));
          }
        } catch (e) {
          console.warn('Firestore favorites sync:', e);
        }
      }
    };
    fetchUserFavorites();
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = async (productId: string) => {
    const nextState = { ...favorites, [productId]: !favorites[productId] };
    setFavorites(nextState);
    localStorage.setItem('fabriq_favorite_store_items', JSON.stringify(nextState));

    const isFavNow = nextState[productId];
    sendNotification(
      isFavNow ? 'Added to Wishlist ❤️' : 'Removed from Wishlist',
      isFavNow ? 'Item saved to your FabriQ Wishlist.' : 'Item removed from your favorites.',
      'system'
    );

    const userId = auth.currentUser?.uid || 'guest';
    if (userId !== 'guest') {
      try {
        const favRef = doc(db, 'user_favorites', `${userId}_store`);
        await setDoc(favRef, { favorites: nextState, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Favorite sync fallback:', err);
      }
    }
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: ApparelProduct) => {
    const chosenSize = selectedSizes[product.id] || product.sizes[0];
    const newItem = {
      id: `${product.id}-${chosenSize}`,
      name: `${product.name} (${chosenSize})`,
      category: 'Boutique Apparel',
      price: product.price,
      qty: 1,
      image: product.imageUrl,
    };

    try {
      const saved = localStorage.getItem('fabriq_cart_items');
      let currentItems = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(currentItems)) currentItems = [];
      const existingIdx = currentItems.findIndex((i: any) => i.id === newItem.id);
      if (existingIdx >= 0) {
        currentItems[existingIdx].qty = (currentItems[existingIdx].qty || 1) + 1;
      } else {
        currentItems.push(newItem);
      }
      localStorage.setItem('fabriq_cart_items', JSON.stringify(currentItems));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn('Cart storage error:', e);
    }

    sendNotification(
      'Added to FabriQ Cart 🛒',
      `${product.name} [Size: ${chosenSize}] added to your cart.`,
      'order_confirmed'
    );
  };

  const handleBuyNow = (product: ApparelProduct) => {
    handleAddToCart(product);
    onNavigate('cart');
  };

  const categories = ['All', 'Shirts', 'T-Shirts', 'Jeans', 'Kurthas', 'Shoes'];

  const filteredProducts = FABRIQ_LUXURY_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.fabric.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#0A0A0A] text-[#F2F2F2] min-h-screen font-sans selection:bg-[#C29C6D] selection:text-black">
      
      {/* Luxury Hero Store Banner */}
      <section className="px-5 pt-5 pb-3">
        <div className="bg-gradient-to-r from-[#0F192C] via-[#1A2333] to-[#0F192C] rounded-3xl p-6 border-2 border-[#C29C6D]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#C29C6D] text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                OFFICIAL FABRIQ STORE
              </span>
              <span className="text-[10px] text-[#C29C6D] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                AUTENTICO COUTURE
              </span>
            </div>

            <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-white leading-tight">
              FabriQ AI Luxury Cloth Store
            </h1>
            <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
              Explore our ready-to-wear luxury wardrobe crafted from Egyptian cotton, Japanese selvedge denim, Italian calfskin, and handwoven silk.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-[11px] text-[#C29C6D] font-bold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                Complimentary Express Shipping
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                Easy 14-Day Atelier Exchange
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills & Search Bar */}
      <section className="px-5 my-3 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C29C6D] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search Shirts, T-Shirts, Jeans, Kurthas, Shoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12121C] border border-[#C29C6D]/30 focus:border-[#C29C6D] text-white text-xs pl-10 pr-10 py-3 rounded-2xl outline-none placeholder:text-slate-500 transition-colors shadow-inner font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Horizontal Scroll Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn-press px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#C29C6D] to-[#D4AF37] text-slate-950 shadow-md font-extrabold scale-105'
                    : 'bg-[#12121C] text-slate-300 border border-slate-800 hover:border-[#C29C6D]/40'
                }`}
              >
                {cat === 'Shirts' && '👔 '}
                {cat === 'T-Shirts' && '👕 '}
                {cat === 'Jeans' && '👖 '}
                {cat === 'Kurthas' && '🥻 '}
                {cat === 'Shoes' && '👞 '}
                {cat === 'All' && '✨ '}
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section className="px-5 my-2">
        {isLoading ? (
          <SkeletonLoader variant="product-grid" count={6} />
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#12121C] rounded-3xl p-8 text-center border border-slate-800 my-6">
            <span className="material-symbols-outlined text-4xl text-[#C29C6D] mb-2 block">
              search_off
            </span>
            <h3 className="text-base font-bold text-white">No products found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              We couldn't find any items matching "{searchQuery}". Try searching for Shirts, Jeans, or Shoes.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#C29C6D] text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const isFav = !!favorites[product.id];
              const selectedSize = selectedSizes[product.id] || product.sizes[0];

              const getLabelType = (cat: string): LabelType => {
                if (cat === 'Kurthas') return 'embroidery';
                if (cat === 'Jeans') return 'leather-patch';
                if (cat === 'Shoes') return 'metallic-badge';
                return 'woven-tag';
              };

              return (
                <div
                  key={product.id}
                  className="bg-[#12121C] rounded-3xl border border-[#C29C6D]/20 hover:border-[#C29C6D]/60 transition-all overflow-hidden shadow-lg flex flex-col justify-between group"
                >
                  {/* Image & Favorite Overlay */}
                  <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                    <FabriQBrandedImage
                      src={product.imageUrl}
                      alt={product.name}
                      category={product.category}
                      labelType={getLabelType(product.category)}
                      containerClassName="w-full h-full"
                      imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121C] via-transparent to-transparent opacity-80 pointer-events-none" />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-3 left-3 z-10 bg-[#C29C6D] text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                        {product.badge}
                      </span>
                    )}

                    {/* FAVORITE HEART BUTTON - HEART PULSE & SCALE TRANSITION EFFECT */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md shadow-xl transform active:scale-125 ${
                        isFav
                          ? 'bg-rose-950/90 border-2 border-rose-500 text-rose-500 ring-4 ring-rose-500/30 animate-heart-pulse'
                          : 'bg-slate-900/80 border border-white/20 text-slate-300 hover:text-white hover:scale-105 hover:bg-slate-900'
                      }`}
                      title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <span
                        className={`material-symbols-outlined text-[22px] transition-all duration-300 ${
                          isFav ? 'text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'text-slate-200'
                        }`}
                        style={{ fontVariationSettings: isFav ? "'FILL' 1, 'wght' 700" : "'FILL' 0, 'wght' 400" }}
                      >
                        {isFav ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>

                    {/* Category Label */}
                    <span className="absolute bottom-3 left-3 text-[10px] font-extrabold text-amber-300 uppercase tracking-widest font-sans">
                      {product.category} • {product.fabric}
                    </span>
                  </div>

                  {/* Details Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-['Libre_Caslon_Text',serif] font-bold text-base text-white group-hover:text-[#C29C6D] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Size Selector */}
                      <div className="mt-3 space-y-1">
                        <span className="text-[9px] font-bold text-[#C29C6D] uppercase tracking-wider block font-sans">
                          SELECT SIZE:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => handleSelectSize(product.id, size)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                selectedSize === size
                                  ? 'bg-[#C29C6D] text-slate-950 shadow-xs border border-amber-300 font-black'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-['Libre_Caslon_Text',serif] font-extrabold text-lg text-white">
                            ₹{product.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                          <span className="material-symbols-outlined text-[14px]">star</span>
                          <span>{product.rating}</span>
                          <span className="text-slate-500">({product.reviewsCount})</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn-press py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-[#C29C6D]/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                          <span>Add to Cart</span>
                        </button>

                        <button
                          onClick={() => handleBuyNow(product)}
                          className="btn-press py-2.5 px-3 bg-gradient-to-r from-[#C29C6D] to-[#D4AF37] hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Buy Now</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <BottomNav activePath="services" onNavigate={onNavigate} />
    </div>
  );
};
