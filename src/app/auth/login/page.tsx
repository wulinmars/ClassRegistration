export default function LoginPage() {
  return (
    <main>
      <h1>登录</h1>
      <form>
        <div>
          <label>邮箱</label>
          <input type="email" />
        </div>
        <div>
          <label>密码</label>
          <input type="password" />
        </div>
      </form>
    </main>
  );
}