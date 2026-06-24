import { useState, useRef } from "react";
import { HiSearch, HiX } from "react-icons/hi";

const SearchBar = ({ onSearch, loading }) => {
  const [input, setInput] = useState("");
  const debounceRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 350);
  };

  const handleClear = () => {
    setInput("");
    onSearch("");
  };

  return (
    <div className="max-w-xl mx-auto relative">
      {loading ? (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      )}
      <input
        id="product-search"
        type="text"
        value={input}
        onChange={handleChange}
        placeholder={loading ? "Searching..." : "Search products..."}
        className="w-full pl-12 pr-10 py-4 rounded-2xl bg-brand-900/80 border border-brand-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300 backdrop-blur-sm"
      />
      {input && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
