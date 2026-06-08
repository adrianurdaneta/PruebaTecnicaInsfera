using System;
using System.Data;

namespace WatchlistAPI.Infrastructure
{
    // Un IDbConnection "falso" que lanza NotSupportedException en todas las operaciones.
    // Permite que la app arranque en entornos donde MySQL no está disponible; leyendo endpoints que dependen de Dapper deberán manejar esta excepción.
    public class FakeDbConnection : IDbConnection
    {
        public string ConnectionString { get => string.Empty; set { } }
        public int ConnectionTimeout => 0;
        public string Database => "Fake";
        public ConnectionState State => ConnectionState.Closed;

        public IDbTransaction BeginTransaction() => throw new NotSupportedException("FakeDbConnection no soporta transacciones.");
        public IDbTransaction BeginTransaction(IsolationLevel il) => throw new NotSupportedException("FakeDbConnection no soporta transacciones.");
        public void ChangeDatabase(string databaseName) => throw new NotSupportedException("FakeDbConnection no soporta ChangeDatabase.");
        public void Close() { }
        public IDbCommand CreateCommand() => throw new NotSupportedException("FakeDbConnection no soporta CreateCommand.");
        public void Open() => throw new NotSupportedException("FakeDbConnection no soporta Open.");
        public void Dispose() { }
    }
}
