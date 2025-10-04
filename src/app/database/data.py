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
    description: str
    status: str

@dataclass
class ExperimentFileData: 
    experiment_id: int
    filename: str
    file_data: bytes



    