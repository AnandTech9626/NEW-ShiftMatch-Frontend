{uploadDrawerDoc && (
          <div className="fixed inset-0 z-50 flex">
            {/* OVERLAY */}
            <div
              onClick={() => {
                setUploadDrawerDoc(null);
                setIsEditMode(false);
                setSelectedFile(null);
              }}
              className="flex-1 bg-black/40 backdrop-blur-sm transition-opacity"
            />

            {/* RIGHT SLIDE PANEL */}
            <div
              className={`w-[500px] h-full bg-white shadow-2xl p-6 transform transition-all duration-300 ease-in-out ${uploadDrawerDoc ? "translate-x-0" : "translate-x-full"
                }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="font-semibold text-lg">
                  {isEditMode ? "Edit" : "Upload"}{" "}
                  {uploadDrawerDoc.name || uploadDrawerDoc.documentName}
                </h3>

                <button
                  onClick={() => {
                    setUploadDrawerDoc(null);
                    setIsEditMode(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* FORM */}
              <div className="space-y-5">
                {/* ISSUED BY */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Issued By
                  </label>
                  <input
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    placeholder="Enter issuing authority"
                    className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                  />
                </div>

                {/* ISSUE DATE */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                  />
                </div>

                {/* EXPIRY DATE */}
                {uploadDrawerDoc?.isExipreDate && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full border px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4039AD]/40"
                    />
                  </div>
                )}

                {/* FILE SECTION */}
                <div className="space-y-3">
                  {/* EXISTING FILE (EDIT MODE ONLY) */}
                  {isEditMode &&
                    selectedUploadedDoc?.documentUrl &&
                    !selectedFile && (
                      <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <LuEye size={16} />
                          <span className="truncate max-w-[180px]">
                            {typeof selectedUploadedDoc.documentUrl === "object"
                              ? (selectedUploadedDoc.documentUrl.url ? selectedUploadedDoc.documentUrl.url.split("/").pop() : "")
                              : selectedUploadedDoc.documentUrl}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleViewFile}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                          >
                            View
                          </button>

                          <button onClick={handleDeleteDocument} disabled={isUploading} className="flex items-center gap-1.5 text-xs px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition disabled:opacity-50">\n {isUploading && <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>} \n Delete\n</button>
                        </div>
                      </div>
                    )}

                  {(!isEditMode || !selectedUploadedDoc?.documentUrl) && (
                    <div
                      onClick={handleUploadClick}
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition"
                    >
                      {selectedFile ? (
                        <p className="text-sm font-medium text-gray-700">
                          {selectedFile.name}
                        </p>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                          <IoCloudUpload size={34} className="text-[#4039AD]" />
                          <p className="text-sm font-medium">
                            Drag & Drop or Browse
                          </p>
                          <span className="text-xs text-gray-400">
                            PDF, JPG, PNG supported
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isEditMode && (
                  <button onClick={() => handleSubmitDocument("details")} disabled={isUploading} className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-70">\n {isUploading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>} \n {isUploading ? "Saving..." : "Save Details"}\n</button>
                )}

                {!isEditMode && (
                  <button onClick={() => handleSubmitDocument()} disabled={isUploading} className="w-full bg-[#4039AD] text-white py-3 rounded-xl text-sm mt-3 flex items-center justify-center gap-2 disabled:opacity-70">\n {isUploading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>} \n {isUploading ? "Submitting..." : "Submit Document"}\n</button>
                )}
              </div>
            </div>
          </div>
        )}