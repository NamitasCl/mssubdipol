import axios from "axios";
import AsyncSelect from "react-select/async";

export default function AsyncFuncionarioSelect({ value, onChange, user }) {
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            callback([]);
            return;
        }

        axios.get(
            `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/funcionarios/search?term=${inputValue}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(resp => {
                console.log("External Funcionario Search:", resp.data); // DEBUG: check key names
                callback(
                    resp.data.map(f => ({
                        value: f.idFun, // Restore usage of ID for compatibility with existing records
                        label: f.nombreCompleto || f.nombre,
                        f // Pass full object to access RUT later
                    }))
                );
            })
            .catch(err => {
                console.error("Error searching funcionarios (external)", err);
                callback([]);
            });
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            placeholder="Buscar funcionario..."
            // --- LO NUEVO ----
            menuPortalTarget={document.body}
            styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                menu: base => ({ ...base, zIndex: 9999 }),
            }}
        // -----------------
        />
    );
}