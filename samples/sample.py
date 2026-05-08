#region: #FF6B6B User Service
import json
from datetime import datetime

#region: #4ECDC4 Database Operations
class UserRepository:
    def __init__(self):
        self.db = Database()

    def find_by_id(self, user_id: int):
        return self.db.query("SELECT * FROM users WHERE id = ?", user_id)

    def save(self, user):
        return self.db.insert("users", user.to_dict())
#endregion

#region: #45B7D1 Validation
class UserValidator:
    @staticmethod
    def validate_email(email: str) -> bool:
        return "@" in email

    @staticmethod
    def validate_age(age: int) -> bool:
        return 0 < age < 150
#endregion

#region: #F7DC6F API Endpoints
@app.route("/api/users")
def get_users():
    repo = UserRepository()
    return jsonify(repo.find_all())
#endregion

#endregion
