import React from 'react';

const GridTable = ({
  columns = [], // [{ label: "S.No", fraction: "0.8fr", className: "" }]
  data = [],
  renderRow,
  isLoading = false,
  emptyMessage = "No items found",
  minRows = 10,
  loaderComponent: LoaderComponent = null,
}) => {
  const gridTemplateColumns = columns.map((col) => col.fraction).join(" ");

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <div
          className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-6 py-2 flex items-center gap-4"
          style={{ display: "grid", gridTemplateColumns }}
        >
          {columns.map((col, idx) => (
            <div key={idx} className={col.className || ""}>
              {col.label}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          Array.from({ length: minRows }).map((_, rowIndex) => (
            <div
              key={`skeleton-row-${rowIndex}`}
              className="flex-1 px-6 py-1 items-center gap-4"
              style={{ display: "grid", gridTemplateColumns }}
            >
              {columns.map((col, colIndex) => (
                <div key={`skeleton-col-${colIndex}`} className={col.className || ""}>
                  <div className="h-3.5 bg-slate-200 rounded animate-pulse w-2/3"></div>
                </div>
              ))}
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-medium">
            {emptyMessage}
          </div>
        ) : (
          <>
            {data.map((item, index) => (
              <div
                key={item._id || index}
                className="flex-1 px-6 py-1 text-sm hover:bg-slate-50 transition items-center gap-4"
                style={{ display: "grid", gridTemplateColumns }}
              >
                {renderRow(item, index)}
              </div>
            ))}
            {/* Ghost padding rows to lock consistent height */}
            {Array.from({ length: Math.max(0, minRows - data.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-1" />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GridTable;
