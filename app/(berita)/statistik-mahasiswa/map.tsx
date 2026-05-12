// "use client";

// import jsVectorMap from "jsvectormap";
// import { useEffect } from "react";
// import "./js/id-mill";
// import "jsvectormap/dist/css/jsvectormap.min.css";

// export default function Map() {
//   useEffect(() => {
//     const map = new jsVectorMap({
//       selector: "#mapOne",
//       map: "id_mill",
//       zoomButtons: true,
//       regionStyle: {
//         initial: { fill: "#C8D0D8" },
//         hover: { fillOpacity: 1, fill: "#3056D3" },
//       },
//       labels: {
//         regions: {
//           render(code: string) {
//             return code.replace("ID-", "");
//           },
//         },
//       },
//     });

//     return () => map.destroy();
//   }, []);

//   return (
//     <div className="h-[422px]">
//       <div id="mapOne" className="mapOne map-btn" />
//     </div>
//   );
// }
