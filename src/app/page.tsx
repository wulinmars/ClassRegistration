import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>内部选课系统</h1>
      <p>请先登录</p>
      <Link href='/login'>登录</Link>
    </main>
  );
}
