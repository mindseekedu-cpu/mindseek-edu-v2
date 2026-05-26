import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-4">MindSeek.edu</h1>
        <p className="text-center text-gray-600 mb-4">Sprint 1 – Beta</p>
        <ChatInterface />
      </div>
    </main>
  );
}
