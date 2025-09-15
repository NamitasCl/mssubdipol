// javascript
// frontend/src/pages/auditoria_servicios_especiales/components/MemoIconset.jsx
import React from "react";
import {FaCar, FaJoint, FaMoneyBillWave} from "react-icons/fa";
import {FaGun, FaPeopleGroup} from "react-icons/fa6";
import {GiHeavyBullets} from "react-icons/gi";
import {TbCodeDots} from "react-icons/tb";

const ICON_CATALOG = [
    {key: "droga", label: "Droga", Icon: FaJoint, props: ["drogas", "droga"]},
    {key: "vehiculo", label: "Vehículo", Icon: FaCar, props: ["vehiculos", "vehiculo"]},
    {key: "armas", label: "Armas", Icon: FaGun, props: ["armas", "arma"]},
    {key: "personas", label: "Personas", Icon: FaPeopleGroup, props: ["personas", "imputados", "detenidos"]},
    {key: "dinero", label: "Dinero", Icon: FaMoneyBillWave, props: ["dinero", "efectivo", "dineroIncautado"]},
    {key: "municiones", label: "Municiones", Icon: GiHeavyBullets, props: ["municiones", "municion"]},
    {
        key: "otras_especies",
        label: "Otras especies",
        Icon: TbCodeDots,
        props: ["otrasEspecies", "otras_especies", "otras especies"],
    },
];

const hasAnyValue = (value) => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    if (typeof value === "number") return value > 0;
    return Boolean(value);
};

export default function MemoIconset({memo, size = 24}) {
    if (!memo) return null;

    const iconsToShow = [];
    ICON_CATALOG.forEach(({key, label, Icon, props}) => {
        const present = props.some((p) => hasAnyValue(memo?.[p]));
        if (present) {
            iconsToShow.push(
                <Icon
                    key={key}
                    size={size}
                    title={label}
                    className="me-1"
                    style={{width: `${size}px`, height: `${size}px`}}
                />
            );
        }
    });

    return <>{iconsToShow}</>;
}