import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/database/supabase'; // Importar el cliente de Supabase
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native'; // Hook para eventos de enfoque en la pantalla

export default function Panel() {
  const [usuario, setUsuario] = useState<any>(null);
  const [progreso, setProgreso] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Estado para controlar la carga
  const navigation = useNavigation();

  // Función para cargar datos del usuario y su progreso
  const fetchUsuarioYProgreso = useCallback(async () => {
    setLoading(true); // Inicia la carga
    try {
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session) {
        navigation.navigate('index'); // Redirigir si no hay sesión
        return;
      }

      const user = session.session.user;

      // Obtener nombre del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('name')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('Error al obtener el nombre del usuario:', userError.message);
        setLoading(false);
        return;
      }

      setUsuario({ email: user.email, name: userData?.name });

      // Obtener progreso del usuario
      const { data: progressData, error: progressError } = await supabase
        .from('ProgressTable')
        .select('level_number, completed')
        .eq('email', user.email);

      if (progressError) {
        console.error('Error al obtener el progreso:', progressError.message);
      } else {
        setProgreso(progressData);
      }
    } catch (error) {
      console.error('Error durante la carga de datos:', error);
    } finally {
      setLoading(false); // Finaliza la carga
    }
  }, [navigation]);

  // Ejecutar fetch de datos solo cuando la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      fetchUsuarioYProgreso();
    }, [fetchUsuarioYProgreso])
  );

  // Mostrar pantalla de carga mientras los datos se obtienen
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  if (!usuario || !progreso) {
    return (
      <View style={styles.container}>
        <Text>No se pudieron cargar los datos.</Text>
      </View>
    );
  }

  const nivelesCompletados = progreso.filter((nivel: any) => nivel.completed).length;
  const totalNiveles = progreso.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola {usuario.name || usuario.email}!</Text>
        <Text style={styles.subHeader}>Bienvenido a tu panel de control</Text>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Progreso del usuario</Text>
        <Text style={styles.progressText}>
          Nivel {nivelesCompletados} de {totalNiveles} completado
        </Text>
      </View>

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
