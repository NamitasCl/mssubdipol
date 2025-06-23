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
                callback(
                    resp.data.map(f => ({
                        value: f.idFun,
                        label: f.nombreCompleto,
                        f
                    }))
                );
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
        />
    );
}
