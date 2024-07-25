import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import eyeOpen from '../assets/images/eye-open.png'; // Ruta a tu imagen
import eyeClosed from '../assets/images/eye-closed.png'; // Ruta a tu imagen

const Transaction = () => {
  const [senderAccount, setSenderAccount] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user is currently logged in.");
        setLoading(false);
        return;
      }

      console.log("Current User ID:", currentUser.uid);

      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setUser(userData);
        } else {
          console.log("No such document!");
        }

        // Fetch user accounts
        const q = query(collection(db, 'cuentas'), where('id', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const accountsList = querySnapshot.docs.map(doc => doc.data());
        console.log('Accounts fetched:', accountsList);
        setUserAccounts(accountsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTransaction = async () => {
    setError('');
    if (Number(amount) <= 0) {
      setError('El monto debe ser mayor a cero.');
      return;
    }
    if (receiverAccount.length !== 10) {
      setError('La cuenta de destino debe tener exactamente 10 dígitos.');
      return;
    }
    try {
      const accountsCollection = collection(db, 'cuentas');

      const senderQuery = query(accountsCollection, where('accountNumber', '==', senderAccount));
      const senderSnapshot = await getDocs(senderQuery);
      const senderDoc = senderSnapshot.docs[0];

      const receiverQuery = query(accountsCollection, where('accountNumber', '==', receiverAccount));
      const receiverSnapshot = await getDocs(receiverQuery);
      const receiverDoc = receiverSnapshot.docs[0];

      if (senderDoc && receiverDoc) {
        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();

        if (senderData.accountBalance >= Number(amount)) {
          const updatedSenderBalance = senderData.accountBalance - Number(amount);
          const updatedReceiverBalance = receiverData.accountBalance + Number(amount);

          await updateDoc(doc(db, 'cuentas', senderDoc.id), {
            accountBalance: updatedSenderBalance
          });
          await updateDoc(doc(db, 'cuentas', receiverDoc.id), {
            accountBalance: updatedReceiverBalance
          });

          // Registrar la transacción
          await addDoc(collection(db, 'transacciones'), {
            tipo: 'transferencia',
            cuentaOrigen: senderAccount,
            cuentaDestino: receiverAccount,
            monto: Number(amount),
            fecha: serverTimestamp(),
            descripcion: description,
            saldoActualizado: updatedSenderBalance // Guardar el saldo actualizado del remitente
          });

          console.log('Transacción completada');
        } else {
          console.error('Fondos insuficientes');
          setError('Fondos insuficientes');
        }
      } else {
        console.error('Cuenta remitente o receptor no encontrada');
        setError('Cuenta remitente o receptor no encontrada');
      }
    } catch (error) {
      console.error('Error al procesar la transacción:', error);
      setError('Error al procesar la transacción');
    }
  };

  const handleReceiverAccountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setReceiverAccount(value);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) && Number(value) >= 0) {
      setAmount(value);
    }
  };

  const validateReceiverAccount = async () => {
    setError('');
    if (receiverAccount.length !== 10) {
      setError('La cuenta de destino debe tener exactamente 10 dígitos.');
      return;
    }
    try {
      const accountsCollection = collection(db, 'cuentas');
      const receiverQuery = query(accountsCollection, where('accountNumber', '==', receiverAccount));
      const receiverSnapshot = await getDocs(receiverQuery);
      const receiverDoc = receiverSnapshot.docs[0];

      if (receiverDoc) {
        const receiverData = receiverDoc.data();
        const clienteDoc = await getDoc(doc(db, 'clientes', receiverData.id));
        if (clienteDoc.exists()) {
          const clienteData = clienteDoc.data();
          setReceiverName(`${clienteData.nombre} ${clienteData.apellido}`);
        } else {
          setError('Cliente no encontrado.');
        }
      } else {
        setError('Cuenta de destino no encontrada.');
      }
    } catch (error) {
      console.error('Error al validar la cuenta de destino:', error);
      setError('Error al validar la cuenta de destino.');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Mostrar mensaje de carga mientras se obtienen los datos
  }

  return (
    <div className="mainContainer">
      {/* {user && (
        <Header firstName={user.nombre} lastName={user.apellido} />
      )} */}
      <div className='sidebar'>
        <Sidebar />
      </div>
      <div className="titleContainer">
        <h2>Transferencia</h2>
      </div>
      <div className="inputContainer">
        <label>Cuenta de origen</label>
        <div className="dropdownContainer">
          <button className="dropdownButton" onClick={() => setDropdownVisible(!dropdownVisible)}>
            {senderAccount ? `${senderAccount}` : 'Seleccione una cuenta'}
            <span className="arrow">{dropdownVisible ? '▲' : '▼'}</span>
          </button>
          {dropdownVisible && (
            <div className="dropdownMenu">
              {userAccounts.map((account, index) => (
                <div 
                  key={index} 
                  className="dropdownItem" 
                  onClick={() => {
                    setSenderAccount(account.accountNumber);
                    setDropdownVisible(false);
                  }}>
                  <div className="account-info">
                    <h4 className="account-number">{account.accountNumber}</h4>
                    <p>Tipo de Cuenta: {account.tipoCuenta}</p>
                    <div className="balance-info">
                      <p>Saldo Disponible: {showBalance ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}` : '***'}</p>
                      <button className="toggleBalanceButton" onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}>
                        <img src={showBalance ? eyeOpen : eyeClosed} alt="Toggle Balance Visibility" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="inputContainer">
        <label>Cuenta de destino</label>
        <div className="receiverAccountContainer">
          <input
            type="text"
            className="inputBoxSmall"
            placeholder="Cuenta de destino"
            value={receiverAccount}
            onChange={handleReceiverAccountChange}
          />
          <button 
            className="validateButton" 
            onClick={validateReceiverAccount} 
            disabled={receiverAccount.length !== 10}
          >
            Validar
          </button>
        </div>
      </div>
      {receiverName && (
        <div className="inputContainer">
          <label>Nombre del receptor</label>
          <input
            type="text"
            className="inputBox"
            value={receiverName}
            readOnly
          />
        </div>
      )}
      <div className="inputContainer">
        <label>Monto</label>
        <input
          type="text"
          className="inputBox"
          placeholder="Monto"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>
      <div className="inputContainer">
        <label>Descripción</label>
        <input
          type="text"
          className="inputBox"
          placeholder="Descripción"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <label className="errorLabel">{error}</label>}
      <div className="buttonContainer">
        <input className="inputButton" type="button" onClick={handleTransaction} value="Realizar Transferencia" />
      </div>
    </div>
  );
};

export default Transaction;
