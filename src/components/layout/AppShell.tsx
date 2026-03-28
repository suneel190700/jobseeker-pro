import TopNav from './TopNav';
import { APP_CONTENT_MAX } from './constants';

export { APP_CONTENT_MAX };

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <div className="app-ambient" aria-hidden />
      <TopNav />
      <main className={`relative z-[1] px-4 pb-8 pt-6 sm:px-6 xl:ml-[292px] xl:px-8 xl:pt-8`}>
        <div className={`mx-auto ${APP_CONTENT_MAX}`}>{children}</div>
      </main>
    </div>
  );
}
