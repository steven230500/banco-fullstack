package com.banco.api.cliente.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "persona")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Genero genero;

    @NotNull
    @Min(0)
    @Max(120)
    @Column(nullable = false)
    private Integer edad;

    @NotBlank
    @Pattern(regexp = "^\\d{10,13}$")
    @Column(nullable = false, unique = true, length = 13)
    private String identificacion;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String direccion;

    @NotBlank
    @Pattern(regexp = "^\\d{7,15}$")
    @Column(nullable = false, length = 15)
    private String telefono;

    protected Persona() {
    }

    protected Persona(DatosPersona datos) {
        actualizarDatosPersonales(datos);
    }

    public final void actualizarDatosPersonales(DatosPersona datos) {
        this.nombre = datos.nombre();
        this.genero = datos.genero();
        this.edad = datos.edad();
        this.identificacion = datos.identificacion();
        this.direccion = datos.direccion();
        this.telefono = datos.telefono();
    }

    public DatosPersona datosPersonales() {
        return new DatosPersona(nombre, genero, edad, identificacion, direccion, telefono);
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Genero getGenero() {
        return genero;
    }

    public Integer getEdad() {
        return edad;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public String getDireccion() {
        return direccion;
    }

    public String getTelefono() {
        return telefono;
    }
}
