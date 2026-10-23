import { Layout } from "../components/Layout";

export function NotFoundPage() {
  return (
    <Layout
      activeSection="none"
      mainClassName="items-center justify-center md:flex-row gap-3 md:gap-[5vw] min-h-[calc(100svh-64px)] md:min-h-[calc(100dvh-64px)]"
    >
      <img
        className="w-100 mb-4"
        id="404"
        src="/404.png"
        alt="404 Illustration"
      />
      <div className="flex flex-col justify-center items-center text-center">
        <span className="text-3xl my-4 font-bold">Page not found</span>
        <span>Oops! That link didn't work.</span>
        <span>Click here to return to homepage</span>
        <a
          className="w-fit border md:border-2 shadow dark:shadow-white p-4 mt-4 rounded-full transition-all md:hover:bg-gray-100 md:dark:hover:bg-[#202020] active:bg-gray-200 dark:active:bg-[#232323] active:scale-96 md:hover:scale-96 md:active:scale-92"
          href="/"
        >
          &larr; Homepage
        </a>
      </div>
    </Layout>
  );
}

