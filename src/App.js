import React, { useEffect, useState } from "react";
import { HeartIcon as HeartOutline,ChatBubbleOvalLeftIcon,PaperAirplaneIcon,XMarkIcon, } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [users, setUsers] = useState({});
  const [selectedPostComments, setSelectedPostComments] = useState(null);

  // ปิด scroll backgroundตอนmodalเปิด
  useEffect(() => {
    document.body.style.overflow = selectedPostComments ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedPostComments]);

  // Fetch posts, users, comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userIds = Array.from({ length: 10 }, (_, i) => i + 1);

        // Fetch users
        const usersData = await Promise.all(
          userIds.map((id) =>
            fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then((r) =>
              r.json()
            )
          )
        );
        setUsers(Object.fromEntries(usersData.map((u) => [u.id, u])));
        // Fetch posts
        const postsData = await Promise.all(
          userIds.map((id) =>
            fetch(
              `https://jsonplaceholder.typicode.com/posts?userId=${id}&_limit=1`
            )
              .then((r) => r.json())
              .then((arr) => arr[0])
          )
        );
        setPosts(postsData);
        // Fetch comments
        const commentsResults = await Promise.all(
          postsData.map((post) =>
            fetch(
              `https://jsonplaceholder.typicode.com/posts/${post.id}/comments`
            ).then((r) => r.json())
          )
        );
        setCommentsByPost(
          Object.fromEntries(postsData.map((p, i) => [p.id, commentsResults[i]]))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center">Instagram Feed</h1>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto py-6 space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            user={users[post.userId]}
            comments={commentsByPost[post.id] || []}
            onShowAllComments={() =>
              setSelectedPostComments({
                post,
                user: users[post.userId],
                comments: commentsByPost[post.id],
              })
            }
          />
        ))}
      </main>
      <>
      </>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          selectedPostComments
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSelectedPostComments(null)}
      ></div>

      {/* Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 px-4 transition-opacity duration-300 ${
          selectedPostComments
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {selectedPostComments && (
          <ModalContent
            selectedPostComments={selectedPostComments}
            onClose={() => setSelectedPostComments(null)}
          />
        )}
      </div>
    </div>
  );
}

/*PostCard Component*/
function PostCard({ post, user, comments, onShowAllComments }) {
  const visibleComments = comments.slice(0, 1);
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 p-5 space-y-4 border border-gray-100">
      {/* Header */}
      <div>
        <p className="font-semibold text-gray-900">{user?.name || `User ${post.userId}`}</p>
        <p className="text-xs text-gray-500">Posted just now</p>
      </div>

      {/* Content */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg">({post.id}){post.title}</h2>
        <p className="text-gray-700 mt-1">{post.body}</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex space-x-4 items-center">
          {liked ? (
            <HeartSolid
              className="w-6 h-6 text-red-500 cursor-pointer transition-transform hover:scale-125"
              onClick={() => setLiked(false)}
            />
          ) : (
            <HeartOutline
              className="w-6 h-6 text-gray-700 cursor-pointer transition-transform hover:scale-125"
              onClick={() => setLiked(true)}
            />
          )}

          <div
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors"
            onClick={onShowAllComments}
          >
            <ChatBubbleOvalLeftIcon className="w-6 h-6 text-gray-700" />
            <span className="text-sm text-gray-700">{comments.length}</span>
          </div>

          <PaperAirplaneIcon className="w-6 h-6 text-gray-300 cursor-not-allowed rotate-45" />
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-2 mt-3">
        {visibleComments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 shadow hover:shadow-md transition-shadow duration-300"
          >
            <p className="text-sm font-semibold text-gray-800">{comment.name}</p>
            <p className="text-xs text-gray-500">{comment.email}</p>
            <p className="text-sm text-gray-700 mt-1">{comment.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/*ModalContent Component*/
function ModalContent({ selectedPostComments, onClose }) {
  const [liked, setLiked] = useState(false);
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl flex flex-col border border-gray-200 transform transition-transform duration-300 scale-95 hover:scale-100"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-gray-200">
          <h2 className="text-center text-lg font-bold text-gray-900">
            โพสต์ของ {selectedPostComments.user?.name}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-5 flex-1 space-y-5">
          {/* Post */}
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div>
              <p className="font-semibold text-gray-800">{selectedPostComments.user?.name}</p>
              <p className="text-xs text-gray-500">Posted just now</p>
            </div>
            <h2 className="font-bold text-lg mt-3 text-gray-900">
              {selectedPostComments.post.title}
            </h2>
            <p className="text-gray-700 mt-2">{selectedPostComments.post.body}</p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-6">
            {liked ? (
              <HeartSolid
                className="w-7 h-7 text-red-500 cursor-pointer transition-transform hover:scale-125"
                onClick={() => setLiked(false)}
              />
            ) : (
              <HeartOutline
                className="w-7 h-7 text-gray-700 cursor-pointer transition-transform hover:scale-125"
                onClick={() => setLiked(true)}
              />
            )}
            <ChatBubbleOvalLeftIcon className="w-7 h-7 text-gray-700 cursor-pointer hover:text-gray-900 transition-colors" />
            <PaperAirplaneIcon className="w-7 h-7 text-gray-300 cursor-not-allowed rotate-45" />
          </div>

          {/* Comments */}
          <div className="space-y-4">
            {selectedPostComments.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 shadow hover:shadow-md transition-shadow duration-300"
              >
                <p className="font-semibold text-gray-800 text-sm">{comment.name}</p>
                <p className="text-xs text-gray-500">{comment.email}</p>
                <p className="text-gray-700 mt-1 text-sm">{comment.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}