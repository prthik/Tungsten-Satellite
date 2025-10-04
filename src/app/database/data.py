from dataclasses import dataclass
@dataclass
class UserData:
    username: str
    pwd_hash: bytes
    api_key_hash: bytes
    credits: int

@dataclass
class ExperimentData: 
    user_id: int
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
    id: str
    w: int
    h: int
    x: int
    y: int
    label: str
    massKg: float = 0.0


@dataclass
class PayloadBuilderData:
    # name is optional human label for the builder configuration
    name: str
    bay_width: int
    bay_height: int
    # items stored as JSON string for easy persistence; frontend should stringify
    items_json: str = ''
    created_at: str = ''



