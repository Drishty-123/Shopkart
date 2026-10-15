const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

export default function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c === "All Categories" ? "" : c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
