import FormularioDinamico from "./FormularioDinamico.jsx";
import FormBuilderEditor from "./FormBuilderEditor.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, X } from "lucide-react";
import { useAuth } from "../../components/contexts/AuthContext.jsx";

function FormBuilderApp() {
    const [fields, setFields] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const navigate = useNavigate();

    const { user } = useAuth();

    const handleBack = () => {
        navigate("/formularios");
    };

    return (
        <div className="relative">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="absolute left-0 top-0 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm z-20"
            >
                <ArrowLeft size={18} />
                Volver
            </button>

            {/* Preview Button */}
            {fields.length > 0 && (
                <button
                    onClick={() => setShowPreview(true)}
                    className="absolute right-0 top-0 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm z-20"
                >
                    <Eye size={18} />
                    Vista previa
                </button>
            )}

            {/* Main Editor */}
            <div className="pt-16">
                <FormBuilderEditor fields={fields} setFields={setFields} />
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800 text-lg">Vista previa del Formulario</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50">
                            <FormularioDinamico fields={fields} user={user} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormBuilderApp;
