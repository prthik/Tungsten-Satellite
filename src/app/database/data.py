from dataclasses import dataclass
@dataclass
class UserData:
    username: str
    pwd_hash: bytes
    api_key_hash: bytes
    credits: int


class ExperimentData: 
    user_id: int
    description: str
    status: str

class ExperimentFileData: 
    experiment_id: int
    filename: str
    file_data: bytes



    