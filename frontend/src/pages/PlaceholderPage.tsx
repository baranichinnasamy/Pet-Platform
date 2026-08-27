export default function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
      <p className="text-sm text-primary-600 mt-4">Coming in the next development phase</p>
    </div>
  );
}
