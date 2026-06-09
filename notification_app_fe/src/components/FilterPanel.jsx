import { ToggleButtonGroup, ToggleButton, Box } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const options = [
  { value: "All", label: "All" },
  { value: "Placement", label: "Placement" },
  { value: "Result", label: "Result" },
  { value: "Event", label: "Event" },
];

export default function FilterPanel({ filter, setFilter }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <FilterListIcon />
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(e, newVal) => newVal && setFilter(newVal)}
        size="small"
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
