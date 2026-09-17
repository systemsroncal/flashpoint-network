export default function LiveTvIcon({ className }: { className?: string }) {
  return (
    <div className={["fpn-live-tv", className].filter(Boolean).join(" ")}>
      <div className="fpn-live-tv-waves">
        <div className="fpn-live-tv-wave fpn-live-tv-wave--big-left" aria-hidden>
          <svg width="6" height="20" fill="none" viewBox="0 0 6 21">
            <path d="M4.194 20a.751.751 0 0 1-.578-.287 16.01 16.01 0 0 1-3.6-9.8C-.15 6.434.955 3.013 3.126.29a.723.723 0 0 1 1.153 0 1.121 1.121 0 0 1 0 1.384A12.17 12.17 0 0 0 1.646 9.85a13.869 13.869 0 0 0 3.125 8.484 1.121 1.121 0 0 1 0 1.384.749.749 0 0 1-.577.282Z" />
          </svg>
        </div>
        <div className="fpn-live-tv-wave fpn-live-tv-wave--small-left" aria-hidden>
          <svg width="5" height="14" fill="none" viewBox="0 0 5 14">
            <path d="M3.163 14a.787.787 0 0 1-.6-.288C-.712 9.902-.865 3.878 2.224.287a.763.763 0 0 1 1.193 0 1.1 1.1 0 0 1 0 1.388c-2.43 2.828-2.279 7.605.34 10.65a1.1 1.1 0 0 1 0 1.389.787.787 0 0 1-.594.286Z" />
          </svg>
        </div>
        <div className="fpn-live-tv-set">
          <svg width="29" height="33" viewBox="0 0 29 33" fill="#ff5000">
            <path d="M24.273 6.473H17.48l4.8-4.687a1.027 1.027 0 0 0 0-1.476 1.09 1.09 0 0 0-1.516 0l-6.206 6.054L8.353.31a1.09 1.09 0 0 0-1.516 0 1.028 1.028 0 0 0 0 1.479l4.8 4.687h-7.89A3.7 3.7 0 0 0 .01 10.124v12.228A3.7 3.7 0 0 0 3.747 26h20.526a3.7 3.7 0 0 0 3.737-3.648v-12.23a3.7 3.7 0 0 0-3.737-3.65Zm1.593 15.877a1.58 1.58 0 0 1-1.6 1.557H3.744a1.578 1.578 0 0 1-1.6-1.557V10.123a1.578 1.578 0 0 1 1.6-1.557H24.27a1.578 1.578 0 0 1 1.6 1.557l-.005 12.227ZM21.092 30.385H6.928a.814.814 0 1 0 0 1.616h14.164a.814.814 0 1 0 0-1.616Z" />
            <path d="M12.01 13.826c0-.735.5-1.036 1.109-.67l4.434 2.675a.717.717 0 0 1 0 1.337l-4.434 2.674c-.61.368-1.11.067-1.11-.67v-5.346Z" />
          </svg>
        </div>
        <div className="fpn-live-tv-wave fpn-live-tv-wave--small-right" aria-hidden>
          <svg width="5" height="14" fill="none" viewBox="0 0 5 14">
            <path d="M.853 14a.787.787 0 0 1-.6-.288 1.1 1.1 0 0 1 0-1.388c2.618-3.045 2.77-7.821.34-10.65a1.1 1.1 0 0 1 0-1.387.763.763 0 0 1 1.192 0C4.875 3.88 4.722 9.9 1.446 13.71a.783.783 0 0 1-.593.29Z" />
          </svg>
        </div>
        <div className="fpn-live-tv-wave fpn-live-tv-wave--big-right" aria-hidden>
          <svg width="6" height="21" fill="none" viewBox="0 0 6 21">
            <path d="M1.896.287a.723.723 0 0 0-1.153 0 1.122 1.122 0 0 0 0 1.384 12.179 12.179 0 0 1 2.63 8.179 13.861 13.861 0 0 1-3.124 8.484 1.122 1.122 0 0 0 0 1.384.722.722 0 0 0 1.153 0 16.03 16.03 0 0 0 3.6-9.8A14.353 14.353 0 0 0 1.896.287Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
