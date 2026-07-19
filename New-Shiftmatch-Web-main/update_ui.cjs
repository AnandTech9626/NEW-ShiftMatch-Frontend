const fs = require('fs');
let content = fs.readFileSync('src/pages/Superadminview/Designations.jsx', 'utf8');

content = content.replace(
  'import { Calendar, Search } from "lucide-react";',
  'import { Calendar, Search, Clock, Building2, User, Layers, Monitor, HeartPulse, MoreVertical } from "lucide-react";'
);

// We need a helper for icons
const helperCode = `
const getIconForIndex = (index) => {
  const icons = [
    { Icon: Building2, bg: "bg-purple-100", text: "text-purple-600" },
    { Icon: User, bg: "bg-blue-100", text: "text-blue-600" },
    { Icon: Layers, bg: "bg-orange-100", text: "text-orange-500" },
    { Icon: Monitor, bg: "bg-emerald-100", text: "text-emerald-600" },
    { Icon: HeartPulse, bg: "bg-rose-100", text: "text-rose-500" },
  ];
  return icons[index % icons.length];
};
`;

content = content.replace('const Designations = () => {', helperCode + '\nconst Designations = () => {');

const tableCode = `
      {/* Custom List Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : currentDesignations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No designations found</div>
        ) : (
          <div className="flex flex-col gap-3">
            {currentDesignations.map((item, index) => {
              const { Icon, bg, text } = getIconForIndex(index);
              const isActive = item.status === "Active";
              return (
                <div key={item._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  {/* Left: Icon & Name */}
                  <div className="flex items-center gap-4 w-1/3">
                    <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center \${bg} \${text} flex-shrink-0\`}>
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-800">{item.designationName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Calendar size={12} />
                        <span>Created on {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Updated Date */}
                  <div className="w-1/4">
                    <p className="text-xs text-gray-400 font-medium mb-1">Updated on</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <Clock size={12} />
                      <span>{new Date(item.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Middle 2: Status */}
                  <div className="w-1/6">
                    <span className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold \${
                      isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }\`}>
                      <span className={\`w-1.5 h-1.5 rounded-full \${isActive ? "bg-emerald-500" : "bg-rose-500"}\`}></span>
                      {item.status}
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 justify-end w-1/6">
                    <button
                      onClick={() => {
                        setEditingDesignationId(item._id);
                        setNewDesignation(item.designationName);
                        setDesignationStatus(item.status);
                        setShowAddDesignation(true);
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="More options">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
`;

content = content.replace(/<GridTable[\s\S]*?renderRow=\{\(item, index\) => \([\s\S]*?\)\}[\s\S]*?\/>/, tableCode);

fs.writeFileSync('src/pages/Superadminview/Designations.jsx', content);
