import {useForm} from "react-hook-form";
import {Container} from "react-bootstrap";

export default function ServiciosMasivosRHF() {
    const {
        register, // "Registra" un campo en el formulario
        handleSubmit, // Envuelve la función de envío que yo hago.
        formState: { errors, isSubmitting} // Estado del formulario
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <Container fluid={"xl"} className="mt-3">
            <nav>
                <h1>Servicios masivos</h1>
            </nav>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="d-flex gap-2 align-items-center my-2">
                        <label htmlFor="nombre">Nombre</label>
                        <input {
                                   ...register("nombre", {})
                               } />
                    </div>
                    <button type="submit" disabled={isSubmitting}>
                        Enviar
                    </button>
                </form>
            </div>
        </Container>
    )
}