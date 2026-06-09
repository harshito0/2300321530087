import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({ query, setQuery }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      placeholder="Search notifications..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}
