# Static table for experiment/request statuses

from dataclasses import dataclass, field
from typing import Optional, List

@dataclass
class Status:
    id: int
    name: str

# Predefined status options
STATUS_OPTIONS = [
    Status(id=1, name="submitted"),
    Status(id=2, name="queued"),
    Status(id=3, name="deployed"),
    Status(id=4, name="completed"),
    Status(id=5, name="failed"),
]


# Static table for module types
    

@dataclass
class PlanOption:
    id: int
    name: str
    perks: str


@dataclass
class SubscriptionPlan:
    id: Optional[int] = None
    credits_to_buy: int = 200
    plan_option_id: Optional[int] = None

    def __post_init__(self):
        # Require plan_option_id to be set and valid (not None, not 0, not empty string)
        if self.plan_option_id in [None, '', 0]:
            raise ValueError("plan_option_id is required if a plan option is selected")

@dataclass
class UserSubscription:
    id: Optional[int] = None
    user_id: int = 0
    plan_id: int = 0
    credits_available: int = 0

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
    subscription_plan_id: int

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
    credits_available: int = 0
    subscriptionplan_id: int = 0
    email: Optional[str] = None


@dataclass
class ExperimentData:
    user_id: Optional[int]
    name: str
    description: str
    status: str
    payload: str = ''
    user_email: Optional[str] = None
    created_at: Optional[str] = None


@dataclass
class ExperimentFileData:
    experiment_id: int
    filename: str
    file_data: bytes




