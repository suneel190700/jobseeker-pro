import TopNav from './TopNav';
import { APP_CONTENT_MAX } from './constants';
export { APP_CONTENT_MAX };

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <div className="app-ambient" aria-hidden />
      <TopNav />
      <main className="px-4 pb-8 pt-6 sm:px-6 xl:px-8 xl:pt-8">
        <div className={`${APP_CONTENT_MAX} mx-auto`}>{children}</div>
      </main>
    </div>
  );
}
