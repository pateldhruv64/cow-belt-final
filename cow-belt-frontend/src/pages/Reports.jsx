// import React from "react";
// import ReportGenerator from "../components/ReportGenerator";
// import Navbar from "../components/Navbar";
// import { useAuth } from "../context/AuthContext";

// const Reports = () => {
//   const { hasRole } = useAuth();

//   if (!hasRole('admin')) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar totalCows={0} alertCount={0} lastUpdate={null} />
//         <div className="max-w-7xl mx-auto p-6">
//           <div className="text-center py-12">
//             <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
//             <p className="text-gray-600">You need admin privileges to access reports.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar totalCows={0} alertCount={0} lastUpdate={null} />
      
//       <div className="max-w-7xl mx-auto p-3 sm:p-6">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">📄 Reports & Analytics</h1>
//           <p className="text-gray-600">Generate and export health, daily, weekly and alert reports</p>
//         </div>

//         {/* Report Generator */}
//         <div className="mb-6 sm:mb-8">
//           <ReportGenerator />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;
