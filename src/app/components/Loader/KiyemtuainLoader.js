'use client';

export default function KiyemtuainLoader({ useImage = false }) {
  return (
    <div className="loader">
      {useImage ? (
        <div className="loader-small-img" />
      ) : (
        <div className="loader-small" />
      )}
      <div className="loader-large" />

      <style jsx>{`
        .loader {
          position: relative;
          width: 70px;
          height: 70px;
        }

        .loader-large {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 65%;
          height: 65%;
          background-color: #f0f9f860;
          border-radius: 15px;
          animation: loading 2s infinite;
        }

        .loader-small {
          position: absolute;
          width: 50%;
          height: 50%;
          inset: 0;
          margin: auto;
          background-color: #5c469c;
          z-index: 2;
          border-radius: 6px;
          animation: loading 2s infinite reverse;
        }

        .loader-small-img {
          position: absolute;
          width: 50%;
          height: 50%;
          inset: 0;
          margin: auto;
          background-image: url('/loader.png');
          background-size: cover;
          background-position: center;
          z-index: 2;
          border-radius: 6px;
          animation: loading 2s infinite reverse;
        }

        @keyframes loading {
          0% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateX(180deg);
          }
        }
      `}</style>
    </div>
  );
}
