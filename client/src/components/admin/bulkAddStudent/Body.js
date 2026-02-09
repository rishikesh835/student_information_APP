import React, { useEffect, useState, useRef } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDispatch, useSelector } from "react-redux";
import { bulkAddStudent } from "../../../redux/actions/adminActions";
import Spinner from "../../../utils/Spinner";
import { SET_ERRORS, ADD_STUDENT } from "../../../redux/actionTypes";
import * as classes from "../../../utils/styles";

const Body = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const errorRef = useRef();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (Object.keys(store.errors).length !== 0) {
      setError(store.errors);
      errorRef.current.scrollIntoView({ behavior: "smooth" });
      setFile(null);
      setFileName("");
    }
  }, [store.errors]);

  useEffect(() => {
    if (store.errors || store.admin.studentsBulkAdded) {
      setLoading(false);
      if (store.admin.studentsBulkAdded) {
        setFile(null);
        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        dispatch({ type: SET_ERRORS, payload: {} });
        dispatch({ type: ADD_STUDENT, payload: false });
      }
    } else {
      setLoading(true);
    }
  }, [store.errors, store.admin.studentsBulkAdded]);

  useEffect(() => {
    dispatch({ type: SET_ERRORS, payload: {} });
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      if (fileExtension === "csv" || fileExtension === "xlsx" || fileExtension === "xls") {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError({});
        setUploadStatus(null);
      } else {
        setError({ fileError: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)" });
        setFile(null);
        setFileName("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError({ fileError: "Please select a file to upload" });
      return;
    }

    setError({});
    setUploadStatus(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    dispatch(bulkAddStudent(formData));
  };

  const handleClear = () => {
    setFile(null);
    setFileName("");
    setError({});
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-[0.8] mt-3 overflow-y-scroll scrollbar-thin scrollbar-track-white scrollbar-thumb-gray-300 h-[33rem]">
      <div className="space-y-5">
        <div className="flex text-gray-400 items-center space-x-2">
          <CloudUploadIcon />
          <h1>Bulk Add Students</h1>
        </div>
        <div className="mr-10 bg-white flex flex-col rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Upload Student Data</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV or Excel file containing student details. The file should include the following columns:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium mb-2">Required columns:</p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>name - Student's full name</li>
                <li>email - Student's email address (must be unique)</li>
                <li>dob - Date of birth (format: YYYY-MM-DD or DD/MM/YYYY)</li>
                <li>department - Department name <span className="text-red-600 font-semibold">(must exist in system)</span></li>
                <li>year - Academic year (1, 2, 3, or 4)</li>
                <li>section - Section number (1, 2, or 3)</li>
                <li>batch - Batch year (e.g., 2020-2024)</li>
                <li>gender - Gender (Male, Female, or Other)</li>
                <li>contactNumber - Contact number</li>
                <li>fatherName - Father's name</li>
                <li>motherName - Mother's name</li>
                <li>fatherContactNumber - Father's contact number</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">⚠️ Important:</span> Make sure all departments mentioned in your file 
                already exist in the system. Add them through "Add Department" if needed.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (CSV or Excel)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                      <CloudUploadIcon className="mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {fileName || "Choose file to upload"}
                      </span>
                    </div>
                  </label>
                </div>
                {fileName && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {fileName}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || !file}
                  className={`${classes.adminFormSubmitButton} ${
                    loading || !file ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Uploading..." : "Upload & Process"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className={classes.adminFormClearButton}
                >
                  Clear
                </button>
              </div>
            </div>

            <div ref={errorRef} className={classes.loadingAndError}>
              {loading && (
                <Spinner
                  message="Processing file and adding students..."
                  height={30}
                  width={200}
                  color="#111111"
                  messageColor="blue"
                />
              )}
              {error.fileError && (
                <p className="text-red-500">{error.fileError}</p>
              )}
              {error.backendError && (
                <div className="text-red-500">
                  <p className="font-semibold">Error: {error.backendError}</p>
                </div>
              )}
              {error.errors && Array.isArray(error.errors) && error.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-red-500 font-semibold mb-2">
                    Detailed Errors ({error.errors.length} total):
                  </p>
                  <div className="max-h-40 overflow-y-auto text-sm text-red-600 space-y-1">
                    {error.errors.slice(0, 10).map((err, idx) => (
                      <p key={idx}>{err}</p>
                    ))}
                    {error.errors.length > 10 && (
                      <p className="text-gray-500">... and {error.errors.length - 10} more errors</p>
                    )}
                  </div>
                </div>
              )}
              {uploadStatus && (
                <p
                  className={`${
                    uploadStatus.success ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {uploadStatus.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Body;

