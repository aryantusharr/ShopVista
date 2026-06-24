import { useState, useEffect, useRef, useCallback } from "react";
import { HiSparkles } from "react-icons/hi";
import API from "../api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

const categories = ["All", "Electronics", "Audio", "Accessories", "Computing", "Lifestyle"];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const productsRef = useRef(null);

  const fetchProducts = useCallback(async (search, cat) => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (cat !== "All") params.category = cat;
      const { data } = await API.get("/products", { params });
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
      if (search || cat !== "All") {
        setTimeout(() => {
          productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts(searchTerm, category);
  }, [fetchProducts, searchTerm, category]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
  };

  return (
    <div className="min-h-screen bg-brand-950">
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-950 to-emerald-950" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-800/50 border border-brand-700/50 text-brand-300 text-sm font-medium mb-6">
            <HiSparkles className="w-4 h-4" />
            Premium Tech Marketplace
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Discover{" "}
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Amazing
            </span>{" "}
            Products
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Curated tech essentials with premium quality. From audio gear to smart
            devices — everything you need, all in one place.
          </p>

          <SearchBar onSearch={handleSearch} loading={loading && !!searchTerm} />
        </div>
      </section>

      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                category === cat
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "bg-brand-900/50 text-slate-400 border border-brand-800/50 hover:text-white hover:border-brand-600/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-brand-700 border-t-brand-400 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">
                {searchTerm ? `Searching for "${searchTerm}"...` : "Loading products..."}
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              {searchTerm ? `No products found for "${searchTerm}"` : "No products found"}
            </p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm ? "Try a different search term" : "Try a different category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
