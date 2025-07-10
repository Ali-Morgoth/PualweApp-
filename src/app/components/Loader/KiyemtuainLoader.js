"use client";

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
          background-color: #87cec1;
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
          background-image: url('/pualwe_logo.png');
          background-size: contain; /* Cambia a contain para respetar la calidad */
          background-position: center;
          background-repeat: no-repeat;
          image-rendering: auto; /* Usa esto para imágenes más nítidas */
          z-index: 2;
          border-radius: 6px;
          animation: loading 6s infinite reverse;
          filter: contrast(1.1) brightness(1.1); /* Aumenta la claridad */
        }


       @keyframes loading {
        0% {
        transform: rotateY(0deg);
           }
        100% {
        transform: rotateY(360deg);
          }
         }

        }
      `}</style>
    </div>
  );
}
