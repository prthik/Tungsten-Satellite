from dataclasses import dataclass, field
from typing import Optional, List

# Static table for experiment/request statuses

from dataclasses import dataclass, field
from typing import Optional, List

@dataclass
class Status:
    id: int
    name: str

# Predefined status options
STATUS_OPTIONS = [
    Status(id=1, name="pending approval"),
    Status(id=2, name="experiment queued"),
    Status(id=3, name="experiment completed"),
    Status(id=4, name="failed"),
]
    

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

# Static table for module types
@dataclass
class ModuleType:
    id: int
    name: str
    w: int
    h: int
    massKg: float
    subscription_plan_option_id: int

# Static list of module types (sync with dashboard)
MODULE_TYPES = [
    ModuleType(id=1, name="Camera", w=2, h=2, massKg=3.2, subscription_plan_option_id=1),
    ModuleType(id=2, name="µLab", w=3, h=2, massKg=5.8, subscription_plan_option_id=1),
    ModuleType(id=3, name="Comms", w=2, h=1, massKg=1.1, subscription_plan_option_id=1),
    ModuleType(id=4, name="Battery", w=1, h=2, massKg=2.4, subscription_plan_option_id=1),

    ModuleType(id=5, name="Camera", w=2, h=2, massKg=3.2, subscription_plan_option_id=2),
    ModuleType(id=6, name="µLab", w=3, h=2, massKg=5.8, subscription_plan_option_id=2),
    ModuleType(id=7, name="Comms", w=2, h=1, massKg=1.1, subscription_plan_option_id=2),
    ModuleType(id=8, name="Battery", w=1, h=2, massKg=2.4, subscription_plan_option_id=2),
    ModuleType(id=9, name="Fire Sensor", w=2, h=1, massKg=1.1, subscription_plan_option_id=2),
    ModuleType(id=10, name="Air thrust Sensor", w=1, h=2, massKg=2.4, subscription_plan_option_id=2),
    ModuleType(id=11, name="Weather Sensor", w=1, h=2, massKg=2.4, subscription_plan_option_id=2),

    ModuleType(id=12, name="Camera", w=2, h=2, massKg=3.2, subscription_plan_option_id=3),
    ModuleType(id=13, name="µLab", w=3, h=2, massKg=5.8, subscription_plan_option_id=3),
    ModuleType(id=14, name="Comms", w=2, h=1, massKg=1.1, subscription_plan_option_id=3),
    ModuleType(id=15, name="Battery", w=1, h=2, massKg=2.4, subscription_plan_option_id=3),
    ModuleType(id=16, name="Fire Sensor", w=2, h=1, massKg=1.1, subscription_plan_option_id=3),
    ModuleType(id=17, name="Air thrust Sensor", w=1, h=2, massKg=2.4, subscription_plan_option_id=3),
    ModuleType(id=18, name="Weather Sensor", w=1, h=2, massKg=2.4, subscription_plan_option_id=3),
    ModuleType(id=19, name="Propulsion Unit", w=1, h=2, massKg=5.0, subscription_plan_option_id=3),
    ModuleType(id=20, name="Cooler Unit", w=1, h=2, massKg=4.0, subscription_plan_option_id=3),
    ModuleType(id=21, name="AI Module", w=2, h=2, massKg=2.7, subscription_plan_option_id=3),
]

def get_modules_for_plan_option(plan_option_id: int) -> List[ModuleType]:
    """
    Return all ModuleType objects for the given subscription plan option id.
    Pass any plan_option_id to dynamically filter modules for that plan.
    """
    return [m for m in MODULE_TYPES if m.subscription_plan_option_id == plan_option_id]
# Utility to clear all module types from the database
def clear_moduletypes_db():
    import sqlite3
    from os import path
    BASE_DIR = path.dirname(path.abspath(__file__))
    db_name = path.join(BASE_DIR, 'site.db')
    conn = sqlite3.connect(db_name)
    try:
        conn.execute("DELETE FROM modules;")
        conn.commit()
    finally:
        conn.close()

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
    name: str
    description: str
    status: str
    payload: str = ''
    notes: Optional[str] = None
    user_email: Optional[str] = None
    created_at: Optional[str] = None
    experimentType: Optional[str] = None
    ModulesNeeded: Optional[str] = None


@dataclass
class ExperimentFileData:
    experiment_id: int
    filename: str
    file_data: bytes




