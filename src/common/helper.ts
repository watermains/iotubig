export function meterTableIndex (index: number) {
    const columnNames = ["meter_name", "site_name", "unit_name", "consumer_type", "dev_eui", "allowed_flow", "battery_level", "valve_status", "createdAt"];
    return columnNames[index];
}

