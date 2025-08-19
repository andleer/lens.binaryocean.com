# Lens Data Organization

This directory contains lens data organized by manufacturer and mount type.

## File Structure

```
lens-data/
├── nikon-z-mount.json     # Nikon Z mount lenses
├── sony-e-mount.json      # Sony E mount lenses
├── canon-rf-mount.json    # Canon RF mount lenses
└── README.md              # This file
```

## Adding New Lenses

1. **Determine the correct file**: Based on manufacturer and mount
2. **Add lens data**: Follow the existing JSON structure
3. **Update imports**: Add new files to `lens-data.service.ts` imports if needed
4. **Update aggregation**: Add the new import to the `allLensData` array in `loadData()`

## File Format

Each lens data file follows this structure:

```json
[
  {
    "id": 1001,
    "manufacturer": "Nikon",
    "model": "Z 100-400mm f/4.5-5.6 VR S",
    "mount": "Nikon Z",
    "teleconverters": [1.4, 2.0],
    "data": [
      {
        "focalLength": 100,
        "aperture": 4.5,
        "minFocus": 0.75,
        "magnification": 0.23
      }
    ]
  }
]
```

## Benefits of This Structure

- ✅ Better organization by manufacturer and mount
- ✅ Easier to find and edit specific lens data
- ✅ Smaller individual files for better maintainability
- ✅ Modular approach for future expansion
- ✅ Minimal changes to existing service architecture
