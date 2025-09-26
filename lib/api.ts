export async function getNews() {
  const r = await fetch("/api/news", { cache: "no-store" });
  if (!r.ok) throw new Error("Falha ao carregar notícias");
  return r.json();
}

export async function toggleLike(newsId: string, userId: string) {
  const s = await (await fetch(`/api/likes?newsId=${newsId}&userId=${userId}`, { cache: "no-store" })).json();
  const liked = s.likedByUser;
  const r = await fetch("/api/likes", {
    method: liked ? "DELETE" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newsId, userId }),
  });
  if (!r.ok) throw new Error("Falha ao alternar like");
  return { liked: !liked };
}

export async function getComments(newsId: string) {
  const r = await fetch(`/api/comments?newsId=${newsId}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Falha ao carregar comentários");
  return r.json();
}

export async function postComment(params: { newsId: string; userId: string; content: string }) {
  const r = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error("Falha ao comentar");
  return r.json();
}
