import { HTTP } from "~/shared/services/http";
import { AccountRepository } from "../../repository/AccountRepository";
import type { AuthenticatedUser } from "~/shared/types/AuthenticatedUser";

class ListAccountsUseCase {
  constructor(private accountRepository: AccountRepository) {}

  async execute(user: AuthenticatedUser) {
    try {
      const data = await this.accountRepository.findByUserId(user.id);
      return HTTP(200, { data, message: "Accounts list" });
    } catch (error) {
      return HTTP(500, { message: "Internal server error", error });
    }
  }
}

export { ListAccountsUseCase };
