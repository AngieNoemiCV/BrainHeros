import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación
import { useFocusEffect } from 'expo-router';

export default function Panel() {
  const [usuario, setUsuario] = useState<any>(null); // Estado para almacenar información del usuario
  const [progreso, setProgreso] = useState<any>(null); // Estado para almacenar el progreso del usuario
  const navigation = useNavigation();


  useFocusEffect(
    useCallback(() => {
      checkSession(); // Verificar si hay una sesión abierta
    }, []),
  );

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession(); // Método correcto para obtener la sesión
      if (!session) {
        navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      } else {
        //console.log("Usuario logueado");
        //console.log("Usuario logueado", session);
      }
    } catch {
      navigation.navigate('index'); // Navegar a la pantalla de inicio de sesión
      return
    }
  };

  // Obtener los detalles del usuario logueado y su progreso
  useEffect(() => {
    const fetchUsuarioYProgreso = async () => {
      // Paso 1: Obtener la sesión del usuario logueado de forma asincrónica
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error al obtener la sesión:', sessionError.message);
        return;
      }

      const user = session?.session?.user;

      if (user) {
        // Paso 2: Consultar la tabla Usuario para obtener el nombre
        const { data: userData, error: userError } = await supabase
          .from('usuario')
          .select('name')
          .eq('email', user.email)
          .single(); // Usamos single ya que solo esperamos un único resultado

        if (userError) {
          console.error('Error al obtener el nombre del usuario:', userError.message);
          return;
        }

        setUsuario({ email: user.email, name: userData?.name });

        // Paso 3: Obtenemos el progreso del usuario desde la tabla ProgressTable
        const { data: progressData, error: progressError } = await supabase
          .from('ProgressTable')
          .select('level_number, completed')
          .eq('email', user.email); // Filtramos por el email del usuario actual

        if (progressError) {
          console.error('Error al obtener el progreso:', progressError.message);
        } else {
          setProgreso(progressData); // Guardamos el progreso en el estado
        }
      }
    };

    fetchUsuarioYProgreso();
  }, []);

  // Si el usuario o el progreso no están listos, mostramos un mensaje de carga
  if (!usuario || !progreso) {
    return (
      <View style={styles.container}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  // Calculamos el progreso actual. Esto depende de la estructura de tu base de datos.
  // Por ejemplo, aquí asumimos que `progreso` es un array con varios niveles.
  const nivelesCompletados = progreso.filter((nivel: any) => nivel.completed).length;
  const totalNiveles = progreso.length;

  return (
    <View style={styles.container}>
      {/* Header con saludo */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola {usuario.name || usuario.email}!</Text>
        <Text style={styles.subHeader}>Bienvenido a tu panel de control</Text>
      </View>

      {/* Sección de progreso del usuario */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Progreso del usuario</Text>
        <Text style={styles.progressText}>
          Nivel {nivelesCompletados} de {totalNiveles} completado
        </Text>
      </View>

      {/* Botones para navegar a las principales secciones */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Niveles')}
        >
          <Text style={styles.buttonText}>Niveles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Trofeos')}
        >
          <Text style={styles.buttonText}>Trofeos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27613C',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#27613C',
  },
  progressText: {
    fontSize: 18,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

});
