from dataclasses import dataclass


@dataclass
class UserData:
    username: str
    pwd_hash: bytes
    api_key_hash: bytes
    credits: int = 0


@dataclass
class ExperimentData:
    user_id: int | None
    name: str
    description: str
    status: str
    payload: str = ''


@dataclass
class ExperimentFileData:
    experiment_id: int
    filename: str
    file_data: bytes


@dataclass
class PayloadItemData:
    module_id: int
    x: int = 0
    y: int = 0
    label: str = ''
    massKg: float = 0.0


@dataclass
class PayloadBuilderData:
    # name is optional human label for the builder configuration
    name: str = ''
    bay_width: int = 4
    bay_height: int = 4
    # items stored as JSON string for easy persistence; frontend should stringify
    items_json: str = ''
    created_at: str = ''


@dataclass
class ModuleType:
    id: int = 0
    name: str = ''
    w: int = 1
    h: int = 1
    massKg: float = 0.0


@dataclass
class PayloadBuilderItemData:
    id: int = 0
    payload_builder_id: int = 0
    module_id: int = 0
    x: int = 0
    y: int = 0
    label: str = ''



