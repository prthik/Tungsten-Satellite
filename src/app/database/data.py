# Static table for module types
from dataclasses import dataclass

@dataclass
class ModuleType:
    id: int
    name: str
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class PayloadBuilderData:
    id: Optional[int]
    name: str
    bay_width: int
    bay_height: int
    created_at: str
    items: List['PayloadBuilderItemData']

@dataclass
class PayloadBuilderItemData:
    id: Optional[int]
    payload_builder_id: Optional[int]
    module_id: int
    x: int
    y: int
    label: str
    massKg: float
from dataclasses import dataclass


@dataclass
class UserData:
    username: str
    pwd_hash: bytes
    api_key_hash: bytes
    credits: int = 0


@dataclass
class ExperimentData:
    user_id: Optional[int]
    name: str
    description: str
    status: str
    payload: str = ''


@dataclass
class ExperimentFileData:
    experiment_id: int
    filename: str
    file_data: bytes




