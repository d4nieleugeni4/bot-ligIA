import asyncio
from pathlib import Path
from typing import Optional
from whatsapp_webhook import WhatsAppBot

# Função principal para rodar o bot
async def main():
    # Cria instância do bot
    bot = WhatsAppBot()

    # Registra comandos
    @bot.on_message(command=".ping")
    async def ping_handler(message):
        await bot.send_message(message.chat_id, "pong")

    @bot.on_message(command=".menu")
    async def menu_handler(message):
        menu = (
            "🛠️ Comandos disponíveis:\n"
            ".ping - Responde com 'pong'\n"
            ".menu - Mostra este menu\n"
            ".list-gp - Lista os integrantes do grupo (só em grupos)"
        )
        await bot.send_message(message.chat_id, menu)

    @bot.on_message(command=".list-gp")
    async def list_gp_handler(message):
        # Verifica se é um grupo
        if not message.is_group:
            await bot.send_message(
                message.chat_id, "⚠️ Este comando só pode ser usado em grupos!"
            )
            return

        # Lista membros do grupo
        members = await bot.get_group_members(message.chat_id)
        if not members:
            await bot.send_message(message.chat_id, "⚠️ Não consegui listar os membros.")
            return

        # Menciona todos os membros
        mentions = "📋 Integrantes do grupo:\n" + "\n".join(
            [f"@{member.phone}" for member in members]
        )
        await bot.send_message(message.chat_id, mentions)

    # Inicia o bot
    print("🤖 Bot está rodando!")
    await bot.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot encerrado!")
