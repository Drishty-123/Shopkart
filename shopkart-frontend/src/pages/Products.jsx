import { useEffect, useState } from "react";
import { getProducts, getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

export default function Products({ onWishlistChange }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [wishlistedIds, setWishlistedIds] = useState(new Set());

  // Fetch which products are already wishlisted once on mount, so cards
  // can show "♥ Added to Wishlist" immediately instead of always
  // starting from "♡ Add to Wishlist". This is independent of the
  // search/filter effect below and doesn't block product rendering if
  // it fails (a logged-out edge case would just leave hearts unfilled).
  useEffect(() => {
    getWishlist()
      .then((res) => {
        setWishlistedIds(new Set(res.data.wishlist.map((p) => p._id)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Debounce: wait a moment after the user stops typing before hitting
    // the API, instead of firing a request on every keystroke.
    const timer = setTimeout(() => {
      setStatus("loading");
      getProducts({ search: search || undefined, category: category || undefined })
        .then((res) => {
          if (!cancelled) {
            setProducts(res.data.products);
            setStatus("success");
          }
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Products</h1>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />

      {status === "loading" && (
        <p className="text-center text-gray-400 text-sm py-16">Loading products...</p>
      )}

      {status === "error" && (
        <p className="text-center text-red-500 text-sm py-16">
          Something went wrong while loading products.
        </p>
      )}

      {status === "success" && products.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-16">No products found.</p>
      )}

      {status === "success" && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initiallyWishlisted={wishlistedIds.has(product._id)}
              onWishlistChange={onWishlistChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
