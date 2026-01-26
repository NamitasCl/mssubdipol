import axios from "axios";
import AsyncSelect from "react-select/async";

export default function AsyncUnidadSelect({ value, onChange, user }) {
    const loadOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 3) {
            callback([]);
            return;
        }
        axios.get(
            `${import.meta.env.VITE_COMMON_SERVICES_API_URL}/unidades/buscar?nombre=${inputValue}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
        )
            .then(resp => {
                callback(
                    resp.data.map(u => ({
                        value: u.idUnidad,
                        label: u.nombreUnidad, // or u.siglasUnidad + " - " + u.nombreUnidad
                        unidad: u
                    }))
                );
            })
            .catch(err => {
                console.error("Error searching units", err);
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
            placeholder="Buscar unidad..."
            noOptionsMessage={() => "Escriba para buscar..."}
            loadingMessage={() => "Cargando..."}
            menuPortalTarget={document.body}
            styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                menu: base => ({ ...base, zIndex: 9999 }),
            }}
        />
    );
}
