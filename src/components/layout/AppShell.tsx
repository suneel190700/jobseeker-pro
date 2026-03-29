import TopNav from './TopNav';
import { APP_CONTENT_MAX } from './constants';

export { APP_CONTENT_MAX };

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <div className="app-ambient" aria-hidden />
      <TopNav />
      <main className={`mx-auto ${APP_CONTENT_MAX} px-5 py-8 md:py-10`}>{children}</main>
    </div>
  );
}
