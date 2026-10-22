export function SiteFooter() {
  return (
    <footer className="flex p-8 min-h-36 bg-gray-200 dark:bg-[#232323]">
      <address className="flex flex-col">
        <span className="text-lg font-bold">Nguyen Hai Cuong</span>
        <span>
          Github:{" "}
          <a
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/haicuong"
          >
            @haicuong
          </a>
        </span>
        <span>
          LinkedIn:{" "}
          <a
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/haicuongnguyen"
          >
            @haicuongnguyen
          </a>
        </span>
        <span>
          Upwork:{" "}
          <a
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.upwork.com/freelancers/haicuong"
          >
            @haicuong
          </a>
        </span>
        <br />
        <span>Contact for work</span>
        <span>
          Email:{" "}
          <a className="text-blue-500" href="mailto:haicuong.work@gmail.com">
            haicuong.work@gmail.com
          </a>
        </span>
      </address>
    </footer>
  );
}

